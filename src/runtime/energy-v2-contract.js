// Canonical Energy V2 reader. This is the only UX adapter allowed to interpret
// sensor.rhi_energy_public_contract_v2. Screens consume projections derived here.
function readEnergyPublicV2(gateway) {
  const envelope = gateway.contract('publicV2');
  const attrs = envelope.attributes || {};
  const array = value => {
    const parsed = parseMaybeJson(value, value);
    if (Array.isArray(parsed)) return parsed.filter(row => row && typeof row === 'object');
    if (parsed && typeof parsed === 'object') return Object.values(parsed).filter(row => row && typeof row === 'object');
    return [];
  };
  const object = value => {
    const parsed = parseMaybeJson(value, value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  };

  const core = object(attrs.core);
  const objects = array(attrs.objects);
  const profiles = array(attrs.profiles);
  const relationships = array(attrs.relationships).map(row => Object.freeze({
    ...row,
    from_asset_id:String(row.from_asset_id || row.source_asset_id || ''),
    to_asset_id:String(row.to_asset_id || row.target_asset_id || ''),
    source_asset_id:String(row.source_asset_id || row.from_asset_id || ''),
    target_asset_id:String(row.target_asset_id || row.to_asset_id || '')
  }));
  const commands = array(attrs.commands);
  const activity = array(attrs.activity);
  const planning = object(attrs.planning);
  const intelligence = object(attrs.intelligence);
  const overview = object(attrs.overview);
  const configuration = object(attrs.configuration);
  const valueAccounting = object(attrs.value_accounting);
  const layers = object(attrs.layers);
  const summary = object(attrs.summary);

  const semantic = raw => {
    const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {value:raw};
    const resolution = source.resolution && typeof source.resolution === 'object' ? source.resolution : {};
    const value = source.value !== undefined ? source.value : null;
    const status = String(source.status || source.availability || resolution.status || (value !== null ? 'AVAILABLE' : 'UNAVAILABLE')).toUpperCase();
    const quality = String(source.quality || (status === 'AVAILABLE' ? 'CANONICAL' : 'UNKNOWN')).toUpperCase();
    const resolved = status === 'AVAILABLE' && value !== null && !['INVALID','STALE'].includes(quality);
    return Object.freeze({
      resolved,
      value,
      display:String(source.display ?? source.display_value ?? (value ?? '—')),
      unit:String(source.unit || ''),
      state:status.toLowerCase(),
      status,
      quality,
      reason:String(source.reason || resolution.reason_code || source.reason_code || source.reason_text || ''),
      source:'RHI_ENERGY_PUBLIC_CONTRACT_V2',
      editable:source.write_supported === true || source.editable === true,
      editor:source.editor || null,
      constraints:source.constraints && typeof source.constraints === 'object' ? source.constraints : {},
      write:source.write && typeof source.write === 'object' ? source.write : null,
      operation:source.operation && typeof source.operation === 'object' ? source.operation : null,
      raw:source
    });
  };

  const coreField = (sectionName, fieldName) => {
    const section = object(core[sectionName]);
    const fields = object(section.fields);
    if (fields[fieldName] !== undefined) return semantic(fields[fieldName]);
    if (section[fieldName] && typeof section[fieldName] === 'object' && Object.prototype.hasOwnProperty.call(section[fieldName],'value')) {
      return semantic(section[fieldName]);
    }
    if (Object.prototype.hasOwnProperty.call(section, fieldName)) {
      const value = section[fieldName];
      return semantic({
        value,
        unit:({power_kw:'kW',net_power_kw:'kW',import_power_kw:'kW',export_power_kw:'kW',attributed_power_kw:'kW',soc_pct:'%',reserve_target_pct:'%',capacity_kwh:'kWh',available_kwh:'kWh'})[fieldName] || null,
        status:value === null || value === undefined ? 'UNAVAILABLE' : 'AVAILABLE',
        quality:value === null || value === undefined ? 'UNKNOWN' : 'CANONICAL',
        reason:value === null || value === undefined ? String(section.reason || '') : null
      });
    }
    return semantic({value:null,status:'UNAVAILABLE',quality:'UNKNOWN',reason:String(section.reason || 'canonical_field_not_published')});
  };

  const coreByKey = new Map([
    ['battery.power_kw', coreField('battery','power_kw')],
    ['battery.soc_pct', coreField('battery','soc_pct')],
    ['battery.capacity_kwh', coreField('battery','capacity_kwh')],
    ['battery.available_kwh', coreField('battery','available_kwh')],
    ['battery.state', coreField('battery','state')],
    ['battery.reserve_target_pct', coreField('battery','reserve_target_pct')],
    ['solar.power_kw', coreField('solar','power_kw')],
    ['grid.net_power_kw', coreField('grid','net_power_kw')],
    ['grid_import.power_kw', coreField('grid','import_power_kw')],
    ['grid_export.power_kw', coreField('grid','export_power_kw')],
    ['grid.flow_direction', coreField('grid','flow_direction')],
    ['site_consumption.power_kw', coreField('consumption','power_kw')],
    ['home_consumption.power_kw', coreField('home','power_kw')],
    ['flexible_loads.power_kw', coreField('flexible','power_kw')],
    ['flexible_loads.attributed_power_kw', coreField('flexible','attributed_power_kw')]
  ]);

  const coreFlexible = object(core.flexible);
  const flexibleAssets = Object.freeze(
    (array(coreFlexible.assets).length ? array(coreFlexible.assets) : objects.filter(row => {
      const type=String(row.asset_type || row.object_class || '').toLowerCase();
      return type === 'flexible_load' || type === 'flexible_asset';
    })).map(row => Object.freeze({ ...row }))
  );
  const planningObjects = Object.freeze(array(layers.planning_objects));
  const objectById = new Map(objects.map(row => [String(row.asset_id || ''), row]).filter(([id]) => id));
  const profileById = new Map(profiles.map(row => [String(row.profile_id || ''), row]).filter(([id]) => id));

  const propertyRows = [];
  const propertyByKey = new Map();
  const propertyByAssetAndKey = new Map();
  const configurationRows = [];
  const addConfigurationRows = (configurationKind, rows) => {
    for (const raw of array(rows)) {
      const key = String(raw.property_key || raw.property_id || raw.key || '');
      if (!key) continue;
      const row = Object.freeze({
        asset_id:String(raw.asset_id || configurationKind),
        configuration_kind:configurationKind,
        ...raw,
        property_id:String(raw.property_id || key),
        property_key:key,
        key
      });
      configurationRows.push(row);
      if (!propertyByKey.has(key)) propertyByKey.set(key,row);
    }
  };
  const pricing = object(configuration.pricing);
  const strategy = object(configuration.strategy);
  addConfigurationRows('pricing', pricing.properties);
  addConfigurationRows('strategy', object(strategy.configured).properties || strategy.configured_properties);

  for (const asset of objects) {
    const assetId = String(asset.asset_id || '');
    for (const raw of array(asset.properties)) {
      const key = String(raw.property_key || raw.property_id || raw.key || '');
      if (!key) continue;
      const row = Object.freeze({ asset_id:assetId, ...raw, property_key:key, key });
      propertyRows.push(row);
      if (!propertyByKey.has(key)) propertyByKey.set(key, row);
      if (assetId) propertyByAssetAndKey.set(`${assetId}::${key}`, row);
    }
  }

  const publicContractOk = envelope.available && String(attrs.contract_id || '') === 'RHI_ENERGY_PUBLIC_CONTRACT_V2';
  const coreContractOk = String(core.contract_id || '') === 'RHI_ENERGY_CORE_V1';
  const requiredCoreSections = Object.freeze(['battery','solar','grid','consumption','home','flexible']);
  const missingCoreSections = Object.freeze(requiredCoreSections.filter(section => !Object.prototype.hasOwnProperty.call(core, section)));
  const coreShapeOk = missingCoreSections.length === 0;
  const capabilities = Object.freeze({
    core:coreContractOk && coreShapeOk,
    core_contract:coreContractOk,
    core_sections:coreShapeOk,
    missing_core_sections:missingCoreSections,
    assets:Array.isArray(objects),
    relationships:Array.isArray(relationships),
    planning:Object.keys(object(planning.horizons)).length > 0,
    pricing:Object.keys(pricing).length > 0,
    strategy:Object.keys(strategy).length > 0,
    value_accounting:Object.keys(valueAccounting).length > 0,
    commands:Array.isArray(commands)
  });
  const compatibilityReason = !publicContractOk
    ? 'public_v2_contract_unavailable'
    : !coreContractOk
      ? 'required_core_contract_missing'
      : !coreShapeOk
        ? `required_core_sections_missing:${missingCoreSections.join(',')}`
        : '';

  return Object.freeze({
    envelope,
    available:publicContractOk && coreContractOk && coreShapeOk,
    publicContractOk,
    coreContractOk,
    coreShapeOk,
    missingCoreSections,
    capabilities,
    compatibilityReason,
    contractVersion:String(attrs.contract_version || envelope.contractVersion || ''),
    release:String(attrs.release || ''),
    health:object(attrs.health).status || String(attrs.health || envelope.state || 'UNKNOWN'),
    core,
    summary,
    objects,
    profiles,
    relationships,
    planning,
    intelligence,
    overview,
    configuration,
    valueAccounting,
    activity,
    layers,
    flexibleAssets,
    planningObjects,
    commands,
    objectById,
    profileById,
    propertyRows:Object.freeze(propertyRows),
    configurationRows:Object.freeze(configurationRows),
    allPropertyRows:Object.freeze([...propertyRows, ...configurationRows]),
    propertyByKey,
    propertyByAssetAndKey,
    coreByKey,
    object(assetId) { return objectById.get(String(assetId || '')) || null; },
    profile(profileId) { return profileById.get(String(profileId || '')) || null; },
    property(key, assetId = '') {
      const id = String(assetId || '');
      return id ? (propertyByAssetAndKey.get(`${id}::${String(key || '')}`) || null) : (propertyByKey.get(String(key || '')) || null);
    },
    field(key, assetId = '') {
      if (!assetId && coreByKey.has(String(key || ''))) return coreByKey.get(String(key || ''));
      return semantic(this.property(key, assetId));
    }
  });
}

function createEnergyAssetProjection(v2, assetId) {
  const asset = v2?.object?.(assetId) || null;
  if (!asset) return null;
  const profile = v2.profile(asset.profile_id) || null;
  const relationships = (v2.relationships || []).filter(row =>
    String(row.source_asset_id || '') === String(assetId)
    || String(row.target_asset_id || '') === String(assetId)
  );
  const properties = (asset.properties || []).map(row => ({
    ...row,
    projection:v2.field(row.property_key || row.property_id || row.key, assetId)
  }));
  const controls = Array.isArray(asset.controls) ? asset.controls : [];
  return Object.freeze({
    identity:Object.freeze({
      asset_id:String(asset.asset_id || ''),
      display_name:String(asset.display_name || asset.name || asset.asset_id || ''),
      asset_type:String(asset.asset_type || asset.object_class || ''),
      object_class:String(asset.object_class || ''),
      profile_id:String(asset.profile_id || ''),
      visual_ref:String(asset.visual_ref || ''),
      source:'RHI_ENERGY_PUBLIC_CONTRACT_V2'
    }),
    lifecycle:Object.freeze({
      state:String(asset.health || asset.status || 'UNKNOWN'),
      publication:asset.property_publication || {},
      source:'RHI_ENERGY_PUBLIC_CONTRACT_V2'
    }),
    properties:Object.freeze(properties),
    property(key) { return v2.field(key, assetId); },
    relationships:Object.freeze(relationships),
    controls:Object.freeze(controls),
    profile,
    raw:asset
  });
}
