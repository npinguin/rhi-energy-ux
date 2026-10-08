// Energy UX domain reader. Canonical object/property entities are the primary
// current-truth authority. Public V2 remains a temporary compatibility surface
// for composed capabilities that have not yet moved to their own canonical view.
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
  // Producer-owned physical charging topology is a first-class Energy V2
  // surface. Keep it separate from Energy logical objects and do not infer it
  // from Home Assistant names/devices in the frontend.
  const connections = Object.freeze(array(attrs.connections).map(row => Object.freeze({...row})));
  const commands = array(attrs.commands);
  const activity = array(attrs.activity);
  const planning = object(attrs.planning);
  const metering = object(attrs.metering);
  const retrospective = object(attrs.retrospective);
  const intelligence = object(attrs.intelligence);
  const overview = object(attrs.overview);
  const configuration = object(attrs.configuration);
  const valueAccounting = object(attrs.value_accounting);
  const layers = object(attrs.layers);
  const summary = object(attrs.summary);
  const experience = object(attrs.experience);
  const presence = Object.freeze({...object(experience.presence)});

  const semantic = raw => {
    const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {value:raw};
    const resolution = source.resolution && typeof source.resolution === 'object' ? source.resolution : {};
    const value = source.value !== undefined ? source.value : null;
    const sourceStatus = String(source.status || '').toUpperCase();
    const resolutionStatus = String(resolution.status || '').toUpperCase();
    const availability = String(
      source.availability
      || (['AVAILABLE','UNAVAILABLE'].includes(sourceStatus) ? sourceStatus : '')
      || (resolutionStatus === 'RESOLVED' ? 'AVAILABLE' : resolutionStatus === 'UNAVAILABLE' ? 'UNAVAILABLE' : '')
      || (value !== null ? 'AVAILABLE' : 'UNAVAILABLE')
    ).toUpperCase();
    const quality = String(source.quality || resolution.quality || (availability === 'AVAILABLE' ? 'CANONICAL' : 'UNKNOWN')).toUpperCase();
    const resolved = availability === 'AVAILABLE' && value !== null && !['INVALID','STALE','NOT_ASSESSED'].includes(quality);
    return Object.freeze({
      resolved,
      value,
      display:String(source.display ?? source.display_value ?? (value ?? '—')),
      unit:String(source.unit || ''),
      state:availability.toLowerCase(),
      status:availability,
      quality,
      normalization_status:sourceStatus && !['AVAILABLE','UNAVAILABLE'].includes(sourceStatus) ? sourceStatus : '',
      resolution_status:resolutionStatus,
      reason:String(source.reason || resolution.reason_code || source.reason_code || source.reason_text || ''),
      source:String(source.canonical_contract || 'RHI_ENERGY_PUBLIC_CONTRACT_V2'),
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

  // Canonical HA property entities are the first authority for live domain truth.
  // They already carry backend-owned availability, quality and presentation
  // metadata, so the frontend must not infer any of these semantics.
  const canonicalPropertyRows = Object.freeze(
    (gateway.canonicalPropertyRows?.() || []).map(raw => Object.freeze({
      ...raw,
      property_id:String(raw.property_id || raw.property_key || ''),
      property_key:String(raw.property_key || ''),
      key:String(raw.property_key || ''),
      canonical_contract:'RHI_ENERGY_CANONICAL_PROPERTY_V1'
    }))
  );
  for (const row of canonicalPropertyRows) {
    if (!row.asset_id || !row.property_key) continue;
    propertyRows.push(row);
    if (!propertyByKey.has(row.property_key)) propertyByKey.set(row.property_key, row);
    propertyByAssetAndKey.set(`${row.asset_id}::${row.property_key}`, row);
  }
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
  const meteringConfiguration = object(configuration.metering);
  const strategy = object(configuration.strategy);
  addConfigurationRows('pricing', pricing.properties);
  addConfigurationRows('metering', meteringConfiguration.properties);
  addConfigurationRows('strategy', object(strategy.configured).properties || strategy.configured_properties);

  for (const asset of objects) {
    const assetId = String(asset.asset_id || '');
    for (const raw of array(asset.properties)) {
      const key = String(raw.property_key || raw.property_id || raw.key || '');
      if (!key) continue;
      const row = Object.freeze({ asset_id:assetId, ...raw, property_key:key, key });
      // Public V2 is compatibility-only here; never overwrite a canonical HA
      // property row for the same asset/property.
      if (!propertyByAssetAndKey.has(`${assetId}::${key}`)) propertyRows.push(row);
      if (!propertyByKey.has(key)) propertyByKey.set(key, row);
      if (assetId && !propertyByAssetAndKey.has(`${assetId}::${key}`)) {
        propertyByAssetAndKey.set(`${assetId}::${key}`, row);
      }
    }

    // Appearance is product presentation metadata, not a semantic measurement.
    // Adapt the backend-owned appearance contract into the generic property writer
    // without polluting the object's published semantic property set.
    const appearance = object(asset.appearance);
    const appearanceWrite = object(appearance.write);
    const appearancePropertyId = String(appearanceWrite?.data?.property_id || '');
    if (
      assetId
      && appearance.editable === true
      && appearanceWrite.supported === true
      && appearancePropertyId
    ) {
      const row = Object.freeze({
        asset_id:assetId,
        property_id:appearancePropertyId,
        property_key:appearancePropertyId,
        key:appearancePropertyId,
        display_name:'Image',
        value:appearance.configured_visual_ref ?? null,
        availability:'AVAILABLE',
        editable:true,
        write_supported:true,
        write:appearanceWrite,
        operation:object(appearance.operation)
      });
      propertyRows.push(row);
      propertyByKey.set(appearancePropertyId,row);
      propertyByAssetAndKey.set(`${assetId}::${appearancePropertyId}`,row);
    }
  }

  const currentAggregateTypes = Object.freeze({
    'battery.power_kw':['battery_system','home_battery_system'],
    'battery.soc_pct':['battery_system','home_battery_system'],
    'battery.capacity_kwh':['battery_system','home_battery_system'],
    'battery.available_kwh':['battery_system','home_battery_system'],
    'battery.state':['battery_system','home_battery_system'],
    'battery.reserve_target_pct':['battery_system','home_battery_system'],
    'solar.power_kw':['solar_production'],
    'grid.net_power_kw':['grid_connection'],
    'grid_import.power_kw':['grid_connection'],
    'grid_export.power_kw':['grid_connection'],
    'grid.flow_direction':['grid_connection'],
    'site_consumption.power_kw':['site_consumption'],
    'home_consumption.power_kw':['home_consumption']
  });
  const currentFieldAliases = Object.freeze({
    'battery.power_kw':['power_kw','current_power_kw','actual_power_kw','battery_power_kw'],
    'battery.soc_pct':['soc_pct','battery_soc_pct'],
    'battery.capacity_kwh':['capacity_kwh','battery_capacity_kwh'],
    'battery.available_kwh':['available_kwh','battery_available_kwh'],
    'battery.state':['operating_state','state'],
    'battery.reserve_target_pct':['reserve_target_pct'],
    'solar.power_kw':['power_kw','current_power_kw','solar_power_kw'],
    'grid.net_power_kw':['net_power_kw','power_kw'],
    'grid_import.power_kw':['import_power_kw','grid_import_power_kw'],
    'grid_export.power_kw':['export_power_kw','grid_export_power_kw'],
    'grid.flow_direction':['flow_direction','direction'],
    'site_consumption.power_kw':['power_kw','current_power_kw','site_consumption_kw'],
    'home_consumption.power_kw':['power_kw','current_power_kw','home_consumption_kw']
  });
  const currentAggregateObject = key => {
    const wanted = new Set((currentAggregateTypes[String(key || '')] || []).map(v=>String(v).toLowerCase()));
    return wanted.size ? (objects.find(row=>wanted.has(String(row.asset_type || row.object_class || '').toLowerCase())) || null) : null;
  };
  const currentField = key => {
    const wanted=String(key || '');
    // Prefer direct canonical property entities. For aggregate keys, the
    // canonical runtime object is already the semantic endpoint.
    const direct = propertyByKey.get(wanted) || null;
    if (direct && String(direct.canonical_contract || '') === 'RHI_ENERGY_CANONICAL_PROPERTY_V1') {
      return semantic(direct);
    }
    const coreFieldValue=coreByKey.get(wanted) || null;
    if (coreFieldValue?.resolved === true) return coreFieldValue;
    const aggregate=currentAggregateObject(wanted);
    if (aggregate) {
      const assetId=String(aggregate.asset_id || '');
      const scoped=assetId ? propertyByAssetAndKey.get(`${assetId}::${wanted}`) : null;
      if (scoped) {
        const projected=semantic(scoped);
        if (projected.resolved === true) return projected;
      }
      for (const alias of currentFieldAliases[wanted] || []) {
        if (!Object.prototype.hasOwnProperty.call(aggregate,alias)) continue;
        const value=aggregate[alias];
        if (value === undefined || value === null || value === '') continue;
        return semantic({value,status:'AVAILABLE',quality:'CANONICAL',source_asset_id:assetId,source_field:alias});
      }
    }
    return coreFieldValue || semantic({value:null,status:'UNAVAILABLE',quality:'UNKNOWN',reason:'canonical_current_field_not_published'});
  };

  const publicContractOk = envelope.available && String(attrs.contract_id || '') === 'RHI_ENERGY_PUBLIC_CONTRACT_V2';
  const corePresent = Object.keys(core).length > 0;
  const capabilities = Object.freeze({
    core:corePresent,
    assets:Array.isArray(objects),
    relationships:Array.isArray(relationships),
    connections:Array.isArray(connections),
    planning:Object.keys(object(planning.horizons)).length > 0,
    metering:Object.keys(object(metering.periods)).length > 0,
    retrospective:Object.keys(retrospective).length > 0,
    pricing:Object.keys(pricing).length > 0,
    metering_configuration:Object.keys(meteringConfiguration).length > 0,
    strategy:Object.keys(strategy).length > 0,
    value_accounting:Object.keys(valueAccounting).length > 0,
    commands:Array.isArray(commands)
  });
  const compatibilityReason = !publicContractOk ? 'public_v2_contract_unavailable' : '';

  return Object.freeze({
    envelope,
    available:publicContractOk,
    publicContractOk,
    corePresent,
    canonicalPropertyRows,
    canonicalObjectRows:Object.freeze(gateway.canonicalObjectRows?.() || []),
    capabilities,
    compatibilityReason,
    contractVersion:String(attrs.contract_version || envelope.contractVersion || ''),
    release:String(attrs.release || ''),
    health:object(attrs.health).status || String(attrs.health || envelope.state || 'UNKNOWN'),
    core,
    summary,
    experience:Object.freeze({...experience, presence}),
    presence,
    objects,
    profiles,
    relationships,
    connections,
    planning,
    metering,
    retrospective,
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
    currentAggregateObject,
    currentField,
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
