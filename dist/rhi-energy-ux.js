(() => {
  const UX_VERSION = 'R4.3.32';
  const RELEASE_ENTITY = 'sensor.rhi_energy_release';
  // ---- src/runtime/public-interface-registry.js ----
// Energy UX product authority. RHI_ENERGY_PUBLIC_CONTRACT_V2 is the sole
// product-state entry point. Release/engineering entities are diagnostics only.
const UX_INTERFACES = Object.freeze({
  publicV2: 'sensor.rhi_energy_public_contract_v2'
});

// ---- src/runtime/energy-contract-gateway.js ----
// Single backend-access owner for Energy UX public product contracts.
  function createEnergyContractGateway(host) {
    const cache = new Map();
    const entityId = contractKey => {
      const key = String(contractKey || '');
      const configured = UX_INTERFACES[key];
      if (!configured) throw new Error(`unknown_energy_contract:${key}`);
      return configured;
    };
    const state = contractKey => {
      const id = entityId(contractKey);
      if (!cache.has(id)) cache.set(id, host.state(id) || null);
      return cache.get(id);
    };
    const attrs = contractKey => state(contractKey)?.attributes || {};
    const contract = contractKey => {
      const id = entityId(contractKey);
      const current = state(contractKey);
      const attributes = current?.attributes || {};
      return {
        contractKey,
        entityId: id,
        state: current?.state ?? null,
        attributes,
        contractVersion: String(firstDefined(attributes.contract_version, attributes.release, '')),
        available: !!current
      };
    };
    return Object.freeze({ entityId, state, attrs, contract });
  }

// ---- src/runtime/energy-v2-contract.js ----
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
      propertyRows.push(row);
      if (!propertyByKey.has(key)) propertyByKey.set(key, row);
      if (assetId) propertyByAssetAndKey.set(`${assetId}::${key}`, row);
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

// ---- src/domain/selectors/energy-selectors.js ----
// Pure Energy product selectors. These functions know the normalized Energy V2
// shape; screens must not know Home Assistant entity ids or raw contract paths.
function selectEnergyAsset(store, assetId) {
  return createEnergyAssetProjection(store, assetId);
}

function selectEnergyOverview(store) {
  const row=store?.overview && typeof store.overview === 'object' ? store.overview : {};
  return Object.freeze({
    available:store?.available === true,
    status:String(row.status || row.product_status || row.state || store?.health || 'UNKNOWN'),
    primary:row.primary || row.primary_metric || null,
    summary:row.summary || {},
    flow:row.flow || {},
    conclusions:Array.isArray(row.conclusions) ? row.conclusions : [],
    reason:String(row.reason || row.product_reason || ''),
    raw:row,
    core:store?.core || {},
    source:'RHI_ENERGY_PUBLIC_CONTRACT_V2.core'
  });
}

function selectEnergyPlanning(store, horizon='D0') {
  const id=String(horizon || 'D0').toUpperCase();
  const planning=store?.planning && typeof store.planning === 'object' ? store.planning : {};
  const horizons=planning.horizons && typeof planning.horizons === 'object' ? planning.horizons : {};
  const row=horizons[id] && typeof horizons[id] === 'object' ? horizons[id] : {};
  return Object.freeze({
    available:store?.available === true && Object.keys(row).length > 0,
    horizon_id:id,
    horizon:row,
    summary:row,
    lane_totals:Object.freeze({
      required_kwh:row.required_kwh ?? null,
      planned_kwh:row.planned_kwh ?? null,
      executed_kwh:row.executed_kwh ?? null,
      still_to_plan_kwh:row.still_to_plan_kwh ?? null,
      flexible_required_kwh:row.flexible_required_kwh ?? null,
      flexible_planned_kwh:row.flexible_planned_kwh ?? null,
      flexible_executed_kwh:row.flexible_executed_kwh ?? null,
      flexible_still_to_plan_kwh:row.flexible_still_to_plan_kwh ?? null
    }),
    buckets:Array.isArray(row.buckets) ? row.buckets : [],
    flexible_plan:{},
    planning_objects:Array.isArray(store?.planningObjects) ? store.planningObjects : [],
    source:'RHI_ENERGY_PUBLIC_CONTRACT_V2.planning.horizons'
  });
}

function selectEnergyConfigurationProperties(store, scope) {
  const kind=String(scope || '').toLowerCase();
  const configuration=store?.configuration && typeof store.configuration === 'object' ? store.configuration : {};
  const section=configuration[kind] && typeof configuration[kind] === 'object' ? configuration[kind] : {};
  if (kind === 'strategy') {
    const configured=section.configured && typeof section.configured === 'object' ? section.configured : {};
    const effective=section.effective && typeof section.effective === 'object' ? section.effective : {};
    const rows=Array.isArray(configured.properties) ? configured.properties : [];
    const effectiveRows=Array.isArray(effective.properties) ? effective.properties : [];
    return Object.freeze({
      available:store?.available === true && configured.status !== 'UNAVAILABLE',
      scope:kind,
      properties:Object.freeze(rows.map(row=>Object.freeze({...row}))),
      effective_properties:Object.freeze(effectiveRows.map(row=>Object.freeze({...row}))),
      effective_state:String(effective.status || 'UNAVAILABLE'),
      effective_reason:String(effective.reason || ''),
      runtime_overrides:Object.freeze((Array.isArray(effective.runtime_overrides) ? effective.runtime_overrides : []).map(row=>Object.freeze({...row}))),
      source:'RHI_ENERGY_PUBLIC_CONTRACT_V2.configuration.strategy'
    });
  }
  const rows=Array.isArray(section.properties) ? section.properties : [];
  return Object.freeze({
    available:store?.available === true && Array.isArray(rows),
    scope:kind,
    properties:Object.freeze(rows.map(row=>Object.freeze({...row}))),
    effective_properties:Object.freeze([]),
    effective_state:String(section.availability || section.status || 'UNAVAILABLE'),
    effective_reason:String(section.reason || ''),
    source:`RHI_ENERGY_PUBLIC_CONTRACT_V2.configuration.${kind}`
  });
}

function selectEnergyStrategies(store) { return selectEnergyConfigurationProperties(store,'strategy'); }
function selectEnergyPricing(store) { return selectEnergyConfigurationProperties(store,'pricing'); }

function selectEnergyValue(store, period='today') {
  const accounting=store?.valueAccounting && typeof store.valueAccounting === 'object' ? store.valueAccounting : {};
  const id=String(period || accounting.selected_period_id || 'today').toLowerCase();
  const periods=accounting.periods && typeof accounting.periods === 'object' ? accounting.periods : {};
  const row=periods[id] && typeof periods[id] === 'object' ? periods[id] : {};
  const selectedId=String(accounting.selected_period_id || '').toLowerCase();
  const netOutcome=accounting.net_financial_result && typeof accounting.net_financial_result === 'object' ? accounting.net_financial_result : {};
  return Object.freeze({
    available:store?.available === true && Object.keys(row).length > 0,
    period_id:id,
    value:row,
    net_financial_result_eur:row.net_financial_result_eur ?? (id === selectedId ? netOutcome.value ?? accounting.net_financial_result_eur ?? null : null),
    net_financial_result:id === selectedId ? netOutcome : {},
    source:'RHI_ENERGY_PUBLIC_CONTRACT_V2.value_accounting'
  });
}

function selectEnergyMetering(store, period='today') {
  const id=String(period || 'today').toLowerCase();
  return Object.freeze({
    available:false,
    partial:false,
    period_id:id,
    metrics:Object.freeze({}),
    reason:'canonical_period_energy_not_published',
    source:'RHI_ENERGY_PUBLIC_CONTRACT_V2'
  });
}

function selectEnergyActivity(store) {
  return Object.freeze({
    available:store?.available === true,
    rows:Object.freeze((Array.isArray(store?.activity) ? store.activity : []).map(row=>Object.freeze({...row}))),
    source:'RHI_ENERGY_PUBLIC_CONTRACT_V2.activity'
  });
}

function selectEnergyCommands(store, assetId='') {
  const wanted=String(assetId || '');
  const rows=(Array.isArray(store?.commands) ? store.commands : [])
    .filter(row=>!wanted || String(row.target_asset_id || '') === wanted)
    .map(row=>Object.freeze({...row}));
  return Object.freeze({
    available:store?.available === true,
    rows:Object.freeze(rows),
    source:'RHI_ENERGY_PUBLIC_CONTRACT_V2.commands'
  });
}

function selectEnergyCoverage(store) {
  const present=value => {
    if(Array.isArray(value)) return value.length > 0;
    return !!value && typeof value === 'object' && Object.keys(value).length > 0;
  };
  const capabilities=Object.freeze({
    core:present(store?.core) ? 'SUPPORTED' : 'UNAVAILABLE',
    assets:present(store?.objects) ? 'SUPPORTED' : 'UNAVAILABLE',
    relationships:Array.isArray(store?.relationships) ? 'SUPPORTED' : 'UNAVAILABLE',
    planning:present(store?.planning?.horizons) ? 'SUPPORTED' : 'UNAVAILABLE',
    pricing:present(store?.configuration?.pricing) ? 'SUPPORTED' : 'UNAVAILABLE',
    strategies:present(store?.configuration?.strategy) ? 'SUPPORTED' : 'UNAVAILABLE',
    commands:Array.isArray(store?.commands) ? 'SUPPORTED' : 'UNAVAILABLE',
    value_accounting:present(store?.valueAccounting) ? 'SUPPORTED' : 'UNAVAILABLE'
  });
  return Object.freeze({
    complete:Object.values(capabilities).every(value=>value === 'SUPPORTED'),
    capabilities,
    unsupported:Object.freeze(Object.entries(capabilities).filter(([,v])=>v!=='SUPPORTED').map(([k])=>k)),
    source:'RHI_ENERGY_PUBLIC_CONTRACT_V2.coverage'
  });
}

// ---- src/app/energy-asset-catalog.js ----
// Energy physical-asset visual catalog.
//
// This catalog is deliberately limited to user-world physical concepts and physical
// installation compositions. Dashboard hero artwork is owned by dashboard/page UX and
// must never be used as an asset fallback.
//
// Default policy (temporary): exact configured/product match first; otherwise the first
// selectable catalog entry for the exact same asset_type; otherwise no image.
const RHI_ENERGY_LOGICAL_VISUALS = Object.freeze([
  { id:"battery_system.generic", asset_type:"battery_system", label:"Home battery system", brand:"Generic", model:"Battery system", variant:"Physical system composition", profile_patterns:["energy.battery_system."], package_path:"energy/battery_system_4_towers.webp", quality:"generic_family", selectable:true },

  { id:"battery.byd_lvs_20", asset_type:"battery", label:"BYD Battery-Box Premium LVS 20.0", brand:"BYD", model:"Battery-Box Premium LVS 20.0", variant:"5 modules / 20 kWh", profile_patterns:["byd_battery_box_premium_lvs_5_module_20kwh"], package_path:"energy/byd_lvs_20.webp", quality:"verified_product", selectable:true },
  { id:"battery.solaredge_home_48v", asset_type:"battery", label:"SolarEdge Home Battery 48V", brand:"SolarEdge", model:"Home Battery 48V", variant:"BAT-05K48", profile_patterns:["solaredge_48v_home_battery"], package_path:"energy/solaredge_home_battery_48v_9_6.webp", quality:"verified_product", selectable:true },
  { id:"battery.huawei_luna2000_15_s0", asset_type:"battery", label:"Huawei LUNA2000-15-S0", brand:"Huawei", model:"LUNA2000-15-S0", variant:"15 kWh", profile_patterns:["huawei_luna2000_15_s0"], package_path:"energy/huawei_luna2000_15_s0.webp", quality:"verified_product", selectable:true },
  { id:"battery.sonnen_batterie10_10", asset_type:"battery", label:"sonnenBatterie 10 · 10 kWh", brand:"sonnen", model:"sonnenBatterie 10", variant:"10 kWh", profile_patterns:["sonnen_batterie_10_10kwh"], package_path:"energy/sonnen_batterie_10_10kwh.webp", quality:"verified_appearance", selectable:true },
  { id:"battery.sonnen_batterie10_20", asset_type:"battery", label:"sonnenBatterie 10 · 20 kWh", brand:"sonnen", model:"sonnenBatterie 10", variant:"20 kWh", profile_patterns:["sonnen_batterie_10_20kwh"], package_path:"energy/sonnen_batterie_10_20kwh.webp", quality:"verified_appearance", selectable:true },

  { id:"solar_zone.generic", asset_type:"solar_zone", label:"Solar zone", brand:"Generic", model:"PV zone", variant:"Physical panel group", profile_patterns:["energy.solar_zone."], package_path:"energy/solar_zone_generic.webp", quality:"generic_family", selectable:true },

  { id:"solar_panel.sunpower_x21_335_blk", asset_type:"solar_panel", label:"SunPower SPR-X21-335-BLK", brand:"SunPower", model:"SPR-X21-335-BLK", variant:"X21 Black · 335 W", profile_patterns:[], package_path:"energy/sunpower_spr_x21_335_blk.webp", quality:"verified_product", selectable:true },
  { id:"solar_panel.jinkosolar_jkm435n_54hl4r", asset_type:"solar_panel", label:"JinkoSolar JKM435N-54HL4R", brand:"JinkoSolar", model:"JKM435N-54HL4R", variant:"Tiger Neo N-Type · 435 W", profile_patterns:[], package_path:"energy/jinkosolar_jkm435n_54hl4r.webp", quality:"verified_product", selectable:true },

  { id:"solar_inverter.solaredge_rwb_10k", asset_type:"solar_inverter", label:"SolarEdge Home Hub 10 kW", brand:"SolarEdge", model:"SE10K-RWB48", variant:"10 kW", profile_patterns:["solaredge_home_hub_10k"], package_path:"energy/solaredge_rwb_10k.webp", quality:"verified_appearance", selectable:true },
  { id:"solar_inverter.solaredge_rws_8k", asset_type:"solar_inverter", label:"SolarEdge StorEdge 8 kW", brand:"SolarEdge", model:"SE8K-RWS", variant:"8 kW", profile_patterns:["solaredge_rws_8k"], package_path:"energy/solaredge_rws_8k.webp", quality:"verified_product", selectable:true },
  { id:"solar_inverter.solaredge_se7k", asset_type:"solar_inverter", label:"SolarEdge Three Phase 7 kW", brand:"SolarEdge", model:"SE7K", variant:"Three phase", profile_patterns:["solaredge_three_phase_7k"], package_path:"energy/solaredge_se7k_rw0tebnn4.webp", quality:"verified_appearance", selectable:true },
  { id:"solar_inverter.huawei_sun2000_4_6ktl_l1", asset_type:"solar_inverter", label:"Huawei SUN2000-4.6KTL-L1", brand:"Huawei", model:"SUN2000-4.6KTL-L1", variant:"4.6 kW · single phase", profile_patterns:["huawei_sun2000_4_6ktl_l1"], package_path:"energy/huawei_sun2000_4_6ktl_l1.webp", quality:"verified_product", selectable:true },
  { id:"solar_inverter.sma_sunny_boy_5", asset_type:"solar_inverter", label:"SMA Sunny Boy 5.0", brand:"SMA", model:"SB5.0-1AV-41", variant:"5.0 kW · single phase", profile_patterns:["sma_sunny_boy_5_0_sb5_0_1av_41"], package_path:"energy/sma_sunny_boy_5_0_sb5_0_1av_41.webp", quality:"verified_product", selectable:true },
  { id:"solar_inverter.sma_sunny_tripower_7000tl", asset_type:"solar_inverter", label:"SMA Sunny Tripower 7000TL", brand:"SMA", model:"STP 7000TL-20", variant:"7.0 kW · three phase", profile_patterns:["sma_sunny_tripower_7000tl_20"], package_path:"energy/sma_sunny_tripower_7000tl_20.webp", quality:"verified_product", selectable:true },

  { id:"solar_optimizer.solaredge_s500b", asset_type:"solar_optimizer", label:"SolarEdge Power Optimizer S500B", brand:"SolarEdge", model:"S500B-1GM4MRM-NA02", variant:"Power Optimizer", profile_patterns:[], package_path:"energy/solaredge_s500b_optimizer.webp", quality:"verified_product", selectable:true },

  { id:"backup_interface.solaredge_3phase", asset_type:"backup_interface", label:"SolarEdge Home Backup Interface 3 Phase", brand:"SolarEdge", model:"BI-NEUNU-3P-01", variant:"Three phase", profile_patterns:[], package_path:"energy/solaredge_backup_interface_3phase.webp", quality:"verified_appearance", selectable:true },

  { id:"gas_meter.flonidan_uniflo_g4", asset_type:"gas_meter", label:"FLONIDAN UniFlo G4", brand:"FLONIDAN", model:"UniFlo G4", variant:"Smart diaphragm gas meter", profile_patterns:["flonidan_uniflo_g4"], package_path:"energy/flonidan_uniflo_g4srtv.webp", quality:"verified_appearance", selectable:true },

  { id:"grid_meter.sagemcom_t211_d3", asset_type:"grid_meter", label:"Sagemcom T211-D3", brand:"Sagemcom", model:"T211-D3", variant:"Electricity meter", profile_patterns:[], package_path:"energy/sagemcom_t211_d3.webp", quality:"verified_appearance", selectable:true }
]);

function rhiEnergyVisualCatalog() {
  return RHI_ENERGY_LOGICAL_VISUALS.map(row => ({ ...row }));
}

function rhiEnergyVisualCatalogForType(assetType = "") {
  const type = String(assetType || "").trim().toLowerCase();
  return rhiEnergyVisualCatalog().filter(row => row.asset_type === type && row.selectable !== false);
}

function rhiEnergyVisualBrandsForType(assetType = "") {
  return [...new Set(rhiEnergyVisualCatalogForType(assetType)
    .map(row => String(row.brand || "").trim())
    .filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
}

function rhiEnergyVisualRef(entryOrId = "") {
  const id = typeof entryOrId === "object" ? String(entryOrId?.id || "") : String(entryOrId || "");
  return id ? `energy.logical.${id}` : "";
}

function rhiEnergyVisualEntryFromRef(visualRef = "") {
  const ref = String(visualRef || "").trim();
  if (!ref.startsWith("energy.logical.")) return null;
  const id = ref.slice("energy.logical.".length);
  return RHI_ENERGY_LOGICAL_VISUALS.find(row => row.id === id) || null;
}

function rhiEnergyVisualEntryMatchesAsset(entry = {}, asset = {}) {
  const assetType = String(asset.asset_type || asset.object_class || "").trim().toLowerCase();
  if (!assetType || entry.asset_type !== assetType) return false;
  const profileId = String(asset.profile_id || asset.raw?.profile_id || "").trim();
  return (entry.profile_patterns || []).some(pattern => profileId === pattern || profileId.startsWith(pattern));
}

function rhiEnergyDefaultVisualEntry(asset = {}) {
  const assetType = String(asset.asset_type || asset.object_class || "").trim().toLowerCase();
  const candidates = rhiEnergyVisualCatalogForType(assetType);
  if (!candidates.length) return null;
  return candidates.find(entry => rhiEnergyVisualEntryMatchesAsset(entry, asset))
    || candidates[0]
    || null;
}

// ---- src/runtime/foundation-visual-registry.js ----
// Generic cross-domain visual presentation resolver.
// Producer domains register visual identity + presentation with Foundation.
// Energy must never carry producer model/brand/image-key mappings.
const RHI_FOUNDATION_VISUAL_REGISTRY_CONTRACT = "RHI_VISUAL_ASSET_REGISTRY_V2";

function readFoundationVisualRegistry(hass = {}) {
  const states = Object.values(hass?.states || {});
  const state = states.find(candidate =>
    String(candidate?.attributes?.contract_id || "") === RHI_FOUNDATION_VISUAL_REGISTRY_CONTRACT
  ) || null;
  const attributes = state?.attributes || {};
  const rawEntries = parseMaybeJson(attributes.entries, attributes.entries);
  const entries = Array.isArray(rawEntries)
    ? rawEntries.filter(row => row && typeof row === "object")
    : [];
  const byRef = new Map(entries.map(row => [String(row.visual_ref || ""), Object.freeze({...row})]).filter(([ref]) => ref));
  return Object.freeze({
    available: !!state,
    entityId: String(state?.entity_id || ""),
    contractId: String(attributes.contract_id || ""),
    contractVersion: String(attributes.contract_version || ""),
    status: String(attributes.status || state?.state || "UNAVAILABLE"),
    entries: Object.freeze(entries),
    entry(visualRef = "") { return byRef.get(String(visualRef || "").trim()) || null; }
  });
}

function rhiRegisteredPresentationUrl(registry, visualRef = "", variant = "card") {
  const ref = String(visualRef || "").trim();
  if (!ref || !registry?.available) return null;
  const entry = registry.entry(ref);
  if (!entry) return null;
  const presentation = entry.presentation && typeof entry.presentation === "object" ? entry.presentation : null;
  const packageId = String(presentation?.package_id || "").trim();
  const variants = presentation?.variants && typeof presentation.variants === "object" ? presentation.variants : {};
  const wanted = String(variant || "card");
  const packagePath = String(
    variants[wanted]
    || variants.card
    || variants.detail
    || variants.thumbnail
    || variants.hero
    || ""
  ).trim();
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(packageId)) return null;
  if (!packagePath || packagePath.startsWith("/") || packagePath.includes("..") || packagePath.includes("://")) return null;
  if (!String(entry.owner_domain || "").trim()) return null;
  return Object.freeze({
    visual_ref: ref,
    owner_domain: String(entry.owner_domain || ""),
    asset_type: String(entry.asset_type || ""),
    kind: String(entry.asset_type || ""),
    url: `/hacsfiles/${packageId}/${packagePath}?r=${encodeURIComponent(String(entry.revision || 1))}`,
    filter: "none",
    fallback: false,
    registry_contract: RHI_FOUNDATION_VISUAL_REGISTRY_CONTRACT
  });
}

// ---- src/runtime/visual-asset-resolver.js ----
// Visual resolver for Energy-owned presentation preferences and registered cross-domain refs.
// Cross-domain visual identity is opaque and resolved only through Foundation registry metadata.
function rhiEnergyVisualAssetUrl(relativePath = "") {
  const normalized = String(relativePath || "").replace(/^\/+/, "");
  return `/hacsfiles/rhi-energy-ux/assets/${normalized}?v=${encodeURIComponent(UX_VERSION)}`;
}

function resolveEnergyOwnedVisualRef(visualRef = "") {
  const ref = String(visualRef || "").trim();
  const entry = typeof rhiEnergyVisualEntryFromRef === "function" ? rhiEnergyVisualEntryFromRef(ref) : null;
  if (!entry) return null;
  const inlineAssets = {
    byd_lvs20: typeof HERO_IMAGE_BYD_LVS20 === "string" ? HERO_IMAGE_BYD_LVS20 : "",
    solaredge_48v_9_6: typeof HERO_IMAGE_SOLAREDGE_92 === "string" ? HERO_IMAGE_SOLAREDGE_92 : ""
  };
  const url = entry.inline_asset
    ? inlineAssets[String(entry.inline_asset || "")] || ""
    : rhiEnergyVisualAssetUrl(entry.package_path || "");
  if (!url) return null;
  return Object.freeze({
    visual_ref: ref,
    owner_domain: "rhi_energy_ux",
    kind: "energy_logical_device",
    asset_type: entry.asset_type,
    catalog_id: entry.id,
    quality: entry.quality || "representative",
    url,
    filter: "none"
  });
}

function resolveEnergyVisualRef(visualRef = "", registry = null, variant = "card") {
  const ref = String(visualRef || "").trim();
  if (!ref) return null;

  // Backend/domain visual refs are registered producer identity. Never interpret
  // their namespace, brand, model, image key or asset id in Energy.
  const registered = typeof rhiRegisteredPresentationUrl === "function"
    ? rhiRegisteredPresentationUrl(registry, ref, variant)
    : null;
  if (registered) return registered;

  // UX-local Energy presentation preferences are not cross-domain semantic identity.
  if (ref.startsWith("energy.logical.")) return resolveEnergyOwnedVisualRef(ref);

  // Missing/unregistered producer identity fails closed. Callers render a neutral icon.
  return null;
}

function resolveEnergyAssetVisual(asset = {}, registry = null, variant = "card") {
  const sourceRef = String(asset.visual_ref || asset.visualRef || asset.raw?.visual_ref || "").trim();

  // Any registered producer/domain visual is authoritative.
  if (sourceRef) {
    const registered = resolveEnergyVisualRef(sourceRef, registry, variant);
    if (registered) return registered;

    // An explicit non-UX-local ref must never be replaced by an Energy semantic image.
    if (!sourceRef.startsWith("energy.logical.")) return null;
  }

  const assetType = String(asset.asset_type || asset.object_class || "").trim().toLowerCase();

  const sourceEntry = typeof rhiEnergyVisualEntryFromRef === "function"
    ? rhiEnergyVisualEntryFromRef(sourceRef)
    : null;
  if (sourceEntry && sourceEntry.asset_type === assetType) {
    return resolveEnergyOwnedVisualRef(sourceRef);
  }

  const fallbackEntry = typeof rhiEnergyDefaultVisualEntry === "function"
    ? rhiEnergyDefaultVisualEntry(asset)
    : null;
  return fallbackEntry ? resolveEnergyOwnedVisualRef(rhiEnergyVisualRef(fallbackEntry)) : null;
}

// ---- src/runtime/asset-profile-contract.js ----
// Canonical Energy Public Contract V2 asset/profile reader.
// The backend owns semantic asset type, profile context and publication completeness.
// UX may select and present this context but never infer it from labels or artwork.
function readEnergyAssetContext(gateway, assetId = "") {
  const v2 = readEnergyPublicV2(gateway);
  if (!v2.available) return { available:false, asset:null, profile:null, publication:null };
  const asset = v2.object(assetId);
  if (!asset) return { available:true, asset:null, profile:null, publication:null };
  const profile = v2.profile(asset.profile_id);
  const publication = asset.property_publication && typeof asset.property_publication === "object"
    ? asset.property_publication
    : null;
  return { available:true, asset, profile, publication };
}

function energyAssetPublicationGap(gateway, assetId = "") {
  const context = readEnergyAssetContext(gateway, assetId);
  const publication = context.publication;
  if (!publication) return { status:"unavailable", missing:[] };
  const missing = Array.isArray(publication.missing_required_property_keys)
    ? publication.missing_required_property_keys.map(String).filter(Boolean)
    : [];
  const unresolved = Array.isArray(publication.unresolved_required_property_keys)
    ? publication.unresolved_required_property_keys.map(String).filter(Boolean)
    : [];
  return {
    status: publication.complete === true && missing.length === 0 ? "complete" : "incomplete",
    missing,
    unresolved,
    resolution_complete: publication.resolution_complete === true,
    authority: String(publication.authority || "RHI_ENERGY_PUBLIC_CONTRACT_V2"),
    v1_fallback_allowed: publication.v1_fallback_allowed === true
  };
}

// ---- src/runtime/consumption-contract.js ----
// Canonical live consumption reader from RHI_ENERGY_PUBLIC_CONTRACT_V2.
// Energy owns all balance semantics; the UX only selects already-resolved core values.
function readLiveConsumptionContract(gateway) {
  const v2 = readEnergyPublicV2(gateway);
  const site = v2.currentField('site_consumption.power_kw');
  const home = v2.currentField('home_consumption.power_kw');
  const flexible = v2.field('flexible_loads.power_kw');
  const attributed = v2.field('flexible_loads.attributed_power_kw');
  const contributors = (v2.flexibleAssets || [])
    .filter(row => {
      const sourceContext = row?.source_context && typeof row.source_context === 'object' ? row.source_context : {};
      const mobilityContext = sourceContext.mobility && typeof sourceContext.mobility === 'object' ? sourceContext.mobility : {};
      const kind = String(firstDefined(row?.participation_state,row?.source_asset_kind,row?.asset_type,row?.object_class,mobilityContext.consumer_fallback,'') || '').toLowerCase();
      return row?.infrastructure_only !== true
        && !['infrastructure_only','charger','connection','unassigned_charger'].includes(kind);
    })
    .map(row => Object.freeze({
      ...row,
      asset_id:String(row.asset_id || ''),
      power_kw:asNumber(firstDefined(row.power_kw,row.current_power_kw,row.actual_power_kw))
    }));
  const statusFor = field => String(field.status || field.state || (field.resolved ? 'AVAILABLE' : 'UNAVAILABLE')).toUpperCase();
  return Object.freeze({
    envelope:v2.envelope,
    siteConsumptionKw:asNumber(site.value),
    homeConsumptionKw:asNumber(home.value),
    flexibleLoadsKw:asNumber(flexible.value),
    attributedFlexibleLoadsKw:asNumber(attributed.value),
    flexibleLoadContributors:Object.freeze(contributors),
    siteStatus:statusFor(site),
    homeStatus:statusFor(home),
    flexibleStatus:statusFor(flexible),
    siteReason:String(site.reason || ''),
    homeReason:String(home.reason || ''),
    flexibleReason:String(flexible.reason || ''),
    available:site.status === 'AVAILABLE' || home.status === 'AVAILABLE' || flexible.status === 'AVAILABLE',
    source:'RHI_ENERGY_PUBLIC_CONTRACT_V2.core'
  });
}

// ---- src/domain/models/current-energy-view-model.js ----
// Canonical current-energy view model. Literal contract keys and direction
// semantics are confined to this adapter so screen renderers cannot drift.
function readTypedPropertyContract(gateway, interfaceKey, propertyKey) {
  const v2 = readEnergyPublicV2(gateway);
  const projected = v2.currentField(propertyKey);
  return Object.freeze({
    envelope:v2.envelope,
    row:projected.raw || {},
    value:projected.value,
    number:asNumber(projected.value),
    text:String(projected.value ?? ''),
    health:String(projected.status || projected.state || 'UNAVAILABLE').toUpperCase(),
    quality:String(projected.quality || ''),
    reason:String(projected.reason || ''),
    source:projected.source
  });
}

function canonicalBatteryState(value) {
  const state = String(value || '').trim().toLowerCase();
  if (['charging','charge'].includes(state)) return 'charging';
  if (['discharging','discharge'].includes(state)) return 'discharging';
  if (['idle','standby','available','ready'].includes(state)) return 'idle';
  return state || 'unavailable';
}

function createBatteryCurrentFlowViewModel(gateway) {
  const signed = readTypedPropertyContract(gateway, 'battery', 'battery.power_kw');
  const stateProperty = readTypedPropertyContract(gateway, 'battery', 'battery.state');
  const soc = readTypedPropertyContract(gateway, 'battery', 'battery.soc_pct');
  const available = readTypedPropertyContract(gateway, 'battery', 'battery.available_kwh');
  const capacity = readTypedPropertyContract(gateway, 'battery', 'battery.capacity_kwh');
  const reserve = readTypedPropertyContract(gateway, 'battery', 'battery.reserve_target_pct');
  const state = canonicalBatteryState(stateProperty.value);
  const projectedPowerKw = signed.number === null ? null : Math.abs(signed.number);
  let displayPowerKw = projectedPowerKw;
  let signedFlowKw = signed.number;
  let direction = 'unknown';
  let label = 'Unavailable';
  let detail = 'Battery flow unavailable';

  if (state === 'charging') {
    direction = 'into_storage';
    label = 'Charging';
    detail = 'Charging from Home Bus';
    signedFlowKw = projectedPowerKw === null ? null : -projectedPowerKw;
  } else if (state === 'discharging') {
    direction = 'out_of_storage';
    label = 'Discharging';
    detail = 'Supplying the Home Bus';
    signedFlowKw = projectedPowerKw;
  } else if (state === 'idle') {
    displayPowerKw = signed.number === null ? null : Math.abs(signed.number);
    signedFlowKw = signed.number === null ? null : 0;
    direction = 'idle';
    label = 'Idle';
    detail = 'No active battery flow';
  }

  const health = signed.health === 'AVAILABLE' && stateProperty.health === 'AVAILABLE' ? 'OK' : 'UNAVAILABLE';
  return Object.freeze({
    state,
    health,
    reason:String(firstDefined(signed.reason, stateProperty.reason, '')),
    signedPowerKw:signed.number,
    chargePowerKw:state === 'charging' ? projectedPowerKw : (signed.number === null ? null : 0),
    dischargePowerKw:state === 'discharging' ? projectedPowerKw : (signed.number === null ? null : 0),
    displayPowerKw,
    signedFlowKw,
    direction,
    label,
    detail,
    flowRole:direction === 'out_of_storage' ? 'producer' : direction === 'into_storage' ? 'consumer' : 'inactive',
    uxVisible:displayPowerKw !== null,
    socPct:soc.number,
    availableKwh:available.number,
    capacityKwh:capacity.number,
    reserveTargetPct:reserve.number,
    valueAvailable:displayPowerKw !== null
  });
}

function createGridCurrentFlowViewModel(gateway) {
  const netPower = readTypedPropertyContract(gateway, 'grid', 'grid.net_power_kw');
  const importPower = readTypedPropertyContract(gateway, 'grid', 'grid_import.power_kw');
  const exportPower = readTypedPropertyContract(gateway, 'grid', 'grid_export.power_kw');
  const directionProperty = readTypedPropertyContract(gateway, 'grid', 'grid.flow_direction');
  const rawDirection = String(firstDefined(directionProperty.value, '') || '').toLowerCase();
  const direction = /export/.test(rawDirection) ? 'exporting' : /import/.test(rawDirection) ? 'importing' : /balanc|idle|none/.test(rawDirection) ? 'balanced' : 'unknown';
  const displayPowerKw = direction === 'exporting' ? exportPower.number : direction === 'importing' ? importPower.number : direction === 'balanced' ? 0 : (netPower.number === null ? null : Math.abs(netPower.number));
  return Object.freeze({
    netPowerKw:netPower.number,
    importPowerKw:importPower.number,
    exportPowerKw:exportPower.number,
    displayPowerKw,
    direction,
    label:direction === 'exporting' ? 'Exporting' : direction === 'importing' ? 'Importing' : direction === 'balanced' ? 'Balanced' : 'Unavailable'
  });
}

function createSolarCurrentViewModel(gateway) {
  const power = readTypedPropertyContract(gateway, 'solar', 'solar.power_kw');
  return Object.freeze({ powerKw:power.number, health:power.health, reason:power.reason });
}

function createCurrentEnergyViewModel(gateway) {
  return Object.freeze({
    battery:createBatteryCurrentFlowViewModel(gateway),
    grid:createGridCurrentFlowViewModel(gateway),
    solar:createSolarCurrentViewModel(gateway),
    consumption:readLiveConsumptionContract(gateway)
  });
}

// ---- src/domain/models/physical-flow-view-model.js ----
// R1.89.39 physical-flow model. Consumers and physical connections are
// separate semantic views and may show the same measured kW. They are never
// summed together. Connection totals and rows come only from one coherent
// backend-owned connection snapshot.
  function buildPhysicalFlowViewModel(runtime, gateway, consumers = [], connections = [], connectionSnapshot = {}) {
    const consumption = readLiveConsumptionContract(gateway);
    const physicalPower = (row, id) => asNumber(firstDefined(
      row?.actual_power_kw,
      row?.current_power_kw,
      row?.power_kw,
      id ? runtime.number(`${id}.actual_power_kw`) : null,
      id ? runtime.number(`${id}.current_power_kw`) : null,
      id ? runtime.number(`${id}.power_kw`) : null
    ));
    const consumerRows = consumers.map(row => {
      const assetId = String(firstDefined(row.asset_id,row.flexible_asset_id,row.target_asset_id,'') || '');
      return Object.freeze({ ...row, asset_id:assetId, physical_power_kw:physicalPower(row, assetId) });
    });
    const connectionRows = connections.map(row => {
      const assetId = String(firstDefined(row.connection_asset_id,row.asset_id,row.charger_id,'') || '');
      return Object.freeze({ ...row, asset_id:assetId, connection_asset_id:assetId, physical_power_kw:asNumber(firstDefined(row.power_kw,row.physical_power_kw)) });
    });
    return Object.freeze({
      consumption,
      siteConsumptionKw:consumption.siteConsumptionKw,
      homeConsumptionKw:consumption.homeConsumptionKw,
      flexibleLoadsKw:consumption.flexibleLoadsKw,
      consumers:Object.freeze(consumerRows),
      connections:Object.freeze(connectionRows),
      connectionPowerKw:asNumber(connectionSnapshot.totalPowerKw),
      snapshotRevision:String(connectionSnapshot.snapshotRevision || ''),
      observedAt:String(connectionSnapshot.observedAt || ''),
      connectionHealth:connectionSnapshot.available ? 'OK' : 'UNAVAILABLE'
    });
  }

// ---- src/domain/models/metering-status-model.js ----
// R1.89.43 end-user mapping. status_label is authoritative when published;
// null energy is never interpreted without measurement state and measured zero remains visible.
  function createMeteringStatusModel(row = {}) {
    const state = String(firstDefined(row.measurement_state,row.status,row.health,row.quality,'UNAVAILABLE') || 'UNAVAILABLE').toUpperCase();
    const labels = {
      MEASURED: 'Measured', TRUSTED: 'Measured', COMPLETE: 'Complete', OK: 'Measured',
      ATTRIBUTION_PENDING: 'Waiting for trusted meter attribution',
      PENDING: 'Waiting for period baseline',
      NOT_APPLICABLE: 'Not applicable',
      UNAVAILABLE: 'Unavailable', UNKNOWN: 'Unavailable', FAILED: 'Measurement failed',
      INCOMPLETE: 'Incomplete measurement', PARTIAL: 'Incomplete measurement'
    };
    const label = String(firstDefined(row.status_label, labels[state], human(state, 'Unavailable')) || 'Unavailable');
    const measured = row.value !== null && row.value !== undefined && ['MEASURED','TRUSTED','COMPLETE','OK'].includes(state);
    const technicalKey = String(firstDefined(row.metric_key,row.semantic_key,row.property_key,row.key,row.asset_id,'') || '').toLowerCase();
    const unattributed = /unattributed|unassigned/.test(technicalKey);
    const value = asNumber(row.value);
    const degraded = /DEGRADED|FAIL|ERROR|INCOMPLETE|PENDING|ATTRIBUTION/.test(state) || asBool(row.attribution_degraded, false);
    const applicable = state !== 'NOT_APPLICABLE' && row.applicable !== false;
    const explicitlyVisible = row.ux_visible === undefined ? true : asBool(row.ux_visible, false);
    return Object.freeze({
      state, label, measured, applicable, unattributed,
      userActionRequired:asBool(row.user_action_required, false),
      visible: explicitlyVisible && applicable && (!unattributed || (value !== null && value > 0.0001) || degraded)
    });
  }

// ---- src/runtime/command-contract.js ----
// Canonical Energy V2 command reader. UX visibility and enablement are backend-owned.
function readEnergyCommandContract(gateway) {
  const v2 = readEnergyPublicV2(gateway);
  const envelope = v2.envelope;
  const roleFor = row => String(row.role || '').trim().toLowerCase();
  const rows = (v2.commands || []).map((value, index) => {
    const row = objectFrom(value);
    const commandId = String(firstDefined(row.command_id, row.action_id, row.command_key, row.id, '') || '');
    const targetAssetId = String(firstDefined(row.target_asset_id, row.asset_id, row.flexible_asset_id, row.planning_target_asset_id, '') || '');
    const visible = asBool(firstDefined(row.visible, row.ux_visible, row.supported), false);
    const enabled = visible && asBool(firstDefined(row.enabled, row.ux_enabled, String(row.availability || '').toUpperCase() === 'AVAILABLE'), false);
    return Object.freeze({
      command_row_id: row.command_instance_id || row.command_row_id || `command_${index + 1}`,
      entity_id: envelope.entityId,
      ...row,
      command_id: commandId,
      target_asset_id: targetAssetId,
      role: roleFor(row),
      contract_valid: !!commandId && !!targetAssetId && !!row.invoke,
      command_owner: String(firstDefined(row.command_owner, row.owner, 'energy') || 'energy'),
      action_kind: String(firstDefined(row.action_kind, row.kind, 'command') || 'command'),
      command_resolved: !!row.invoke,
      currently_applicable: enabled,
      visible,
      enabled,
      blocked_reason:String(firstDefined(row.blocked_reason, row.reason?.message, row.reason?.code, '')),
      user_action_text:String(firstDefined(row.user_action_text, ''))
    });
  });
  return Object.freeze({ envelope, rows, source:'RHI_ENERGY_PUBLIC_CONTRACT_V2' });
}

// ---- src/runtime/command-action-model.js ----
// Stable R1.89.39 UX action model. Labels, visibility, enablement and blocked
// guidance are published by the command owner and are not reconstructed.
  function createCommandActionModel(command) {
    if (!command || command.visible !== true || !command.invoke) return null;
    const role = String(command.role || '').toLowerCase();
    const reason = String(firstDefined(command.blocked_reason, command.user_action_text, command.enabled ? 'Available' : 'Currently unavailable') || 'Currently unavailable');
    return Object.freeze({
      id: command.command_id,
      rowId: command.command_instance_id || command.command_row_id || '',
      targetAssetId: command.target_asset_id || '',
      role,
      label: String(firstDefined(command.label, human(role)) || ''),
      owner: command.command_owner || '',
      kind: command.action_kind || '',
      visible: true,
      enabled: command.enabled === true,
      currentlyApplicable: command.enabled === true,
      reason,
      userActionText:String(command.user_action_text || ''),
      command
    });
  }
  function commandActionModelsForAsset(commandContract, assetId) {
    const wanted = String(assetId || '');
    const order = { start: 10, stop: 20, pause: 30, resume: 40 };
    return commandContract.rows
      .filter(row => String(row.target_asset_id || '') === wanted && row.contract_valid === true)
      .map(createCommandActionModel)
      .filter(Boolean)
      .sort((a, b) => (order[a.role] || 99) - (order[b.role] || 99));
  }
  const ENGINEERING_DIAGNOSTICS = [
    'sensor.energy_runtime_deployment_health',
    'sensor.energy_runtime_proof_health',
    'sensor.energy_audit_closure_health',
    'sensor.energy_contract_version_consistency_health',
    'sensor.energy_home_intelligence_contract_standard_health'
  ];
  const SUPPLEMENTAL_DIAGNOSTICS = [
    'sensor.energy_solar_excess_supervisor_health',
    'sensor.energy_property_index_health',
    'sensor.energy_command_index_health',
    'sensor.energy_activity_index_health',
    'sensor.energy_relationship_index_health',
    'sensor.energy_intelligence_index_health',
    'sensor.energy_metering_integrity_health',
    'sensor.energy_publication_health',
    'sensor.energy_contract_traceability_health'
  ];

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const parseMaybeJson = (value, fallback = null) => {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value !== 'string') return value;
    const text = value.trim();
    if (!text) return fallback;
    try { return JSON.parse(text); } catch { return value; }
  };
  const asArray = (value) => {
    const parsed = parseMaybeJson(value, value);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') return Object.values(parsed);
    if (typeof parsed === 'string') return parsed.split(',').map(s => s.trim()).filter(Boolean);
    return [];
  };
  const asBool = (value, fallback = false) => {
    if (value === true || value === false) return value;
    const s = String(value ?? '').trim().toLowerCase();
    if (['true','1','yes','on','ok','ready','active','enabled','available'].includes(s)) return true;
    if (['false','0','no','off','fail','degraded','blocked','disabled','inactive','unavailable'].includes(s)) return false;
    return fallback;
  };
  const asNumber = (value) => {
    // Missing values are semantically different from a measured numeric zero.
    // Number(null), Number('') and Number(undefined) must never leak as 0 into UX.
    if (value === undefined || value === null || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };
  const rowValue = (row, fallback = null) => {
    if (!row || typeof row !== 'object') return row ?? fallback;
    const value = row.value ?? row.current_value ?? row.state ?? row.native_value ?? row.numeric_value ?? row.last_value;
    return value === undefined || value === null || value === '' ? fallback : value;
  };
  const fmtNumber = (value, decimals = 1, fallback = '—') => {
    const n = asNumber(value);
    return n === null ? fallback : n.toFixed(decimals);
  };
  const fmtKw = (value, fallback = '—') => {
    const n = asNumber(value);
    return n === null ? fallback : `${Math.abs(n).toFixed(1)} kW`;
  };
  const fmtKwh = (value, fallback = '—') => {
    const n = asNumber(value);
    return n === null ? fallback : `${Math.abs(n).toFixed(1)} kWh`;
  };
  const fmtPct = (value, fallback = '—') => {
    const n = asNumber(value);
    return n === null ? fallback : `${Math.round(n)}%`;
  };
  const fmtEur = (value, fallback = '—') => {
    const n = asNumber(value);
    return n === null ? fallback : `€${n.toFixed(2)}`;
  };

  const rowState = (row) => {
    if (!row || row.missing) return 'missing';
    const value = rowValue(row, null);
    const health = String(row.health ?? row.quality ?? row.value_status ?? row.status ?? '').trim().toLowerCase();
    if (['fail','failed','error','critical','unavailable'].includes(health)) return 'fail';
    if (['degraded','stale','warning','warn','low_quality','partial','estimated','estimate','forecast','forecasted','modelled','modeled'].includes(health)) return 'warn';
    if (['unknown','not_published','not_available','missing'].includes(health)) return value === null ? 'missing' : 'unknown';
    if (['ok','ready','healthy','good','valid','fresh'].includes(health)) return 'ok';
    return value === null ? 'not-measured' : 'unknown';
  };
  const rowStatusLabel = (row) => {
    const state = rowState(row);
    if (state === 'ok') return 'OK';
    if (state === 'warn') return human(row.health || row.quality || 'Degraded');
    if (state === 'fail') return human(row.health || row.quality || 'Fail');
    if (state === 'missing') return rhiEnergyT(null,'common.not_available',{},'Not available');
    if (state === 'not-measured') return rhiEnergyT(null,'common.not_measured',{},'Not measured');
    return rhiEnergyT(null,'common.unknown',{},'Unknown');
  };
  const rowDisplayValue = (row, fallback = '—') => {
    if (!row || row.missing) return fallback;
    const value = rowValue(row, null);
    if (value === null || value === undefined || value === '') return rhiEnergyT(null,'common.not_measured',{},'Not measured');
    if (typeof value === 'number') return `${value}${row.unit ? ` ${row.unit}` : ''}`;
    return `${human(value, fallback)}${row.unit ? ` ${row.unit}` : ''}`;
  };

  const human = (value, fallback = '—') => {
    if (value === undefined || value === null || value === '') return fallback;
    if (Array.isArray(value)) return value.length ? value.map(v => human(v, '')).filter(Boolean).join(', ') : fallback;
    if (typeof value === 'object') return value.display_name || value.name || value.label || value.summary || value.reason || fallback;
    return String(value)
      .replace(/^energy_intelligence\./, '')
      .replace(/^battery_strategy\./, '')
      .replace(/^consumer_strategy\./, '')
      .replace(/^forecast\./, '')
      .replace(/[_.]+/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  const humanReason = (value, fallback = '—') => {
    if (value === undefined || value === null || value === '') return fallback;
    const raw = typeof value === 'object' ? (value.message || value.user_label || value.label || value.display_name || value.reason || value.reason_code || value.code || '') : String(value);
    const key = String(raw || '').trim();
    if (!key) return fallback;
    const normalized = key.toLowerCase().replace(/[\s.-]+/g, '_');
    const labels = {
      policy_mode_off: rhiEnergyT(null,'reason.intelligence_off',{},'Energy Intelligence is off'),
      mode_off: rhiEnergyT(null,'reason.intelligence_off',{},'Energy Intelligence is off'),
      intelligence_off: rhiEnergyT(null,'reason.intelligence_off',{},'Energy Intelligence is off'),
      energy_intelligence_off: rhiEnergyT(null,'reason.intelligence_off',{},'Energy Intelligence is off'),
      automation_disabled: rhiEnergyT(null,'reason.automation_disabled',{},'Automation is disabled'),
      disabled: rhiEnergyT(null,'reason.disabled',{},'Disabled'),
      not_available: rhiEnergyT(null,'reason.not_available',{},'Not available'),
      not_published: rhiEnergyT(null,'reason.not_published',{},'Information is not available yet'),
      no_battery_policy_reason_published: rhiEnergyT(null,'reason.no_battery_policy',{},'Battery policy information is not available yet'),
      data_incomplete: rhiEnergyT(null,'reason.data_incomplete',{},'Some details are unavailable'),
      trust_state: rhiEnergyT(null,'reason.verification_required',{},'Verification is needed'),
      baseline_untrusted: rhiEnergyT(null,'reason.verification_required',{},'Verification is needed'),
      reset_pending: rhiEnergyT(null,'reason.reset_pending',{},'Reset in progress'),
      approval_required: rhiEnergyT(null,'reason.confirmation_needed',{},'Confirmation needed'),
      configuration_required: rhiEnergyT(null,'reason.not_configured',{},'Setup needed')
    };
    return labels[normalized] || human(key, fallback);
  };

  const normalizeHealthState = (state) => String(state ?? '').trim();
  const isOkHealth = (state) => normalizeHealthState(state).toUpperCase() === 'OK';
  const isIgnoredDiagnosticState = (state) => ['unknown','unavailable',''].includes(normalizeHealthState(state).toLowerCase());
  const labelHealthEntity = (entityId) => human(String(entityId || '')
    .replace(/^sensor\.energy_/, '')
    .replace(/_health$/, '') || entityId);


  function canonicalEditableProperty(row = {}) {
    const write = objectFrom(row.write || row.write_operation || {});
    const operationId = String(firstDefined(write.operation_id, row.write_operation, row.operation_id, '') || '');
    return asBool(firstDefined(row.editable, row.write_supported, operationId === 'energy.property.write'), false)
      && operationId === 'energy.property.write'
      && !!String(firstDefined(write.readback_property, row.readback_property, row.property_id, row.key, '') || '');
  }
  class EnergyRuntime {
    constructor(hass) {
      this.hass = hass || {};
      rhiEnergySetLocaleFromHass(this.hass);
      this._allowed = null;
      this._rows = null;
      this._assets = null;
      this._commands = null;
      this._activities = null;
      this._flexibleAssets = null;
      this._consumerMixRows = null;
      this._consumerMixSummary = null;
      this._planningExperienceRows = null;
      this._commandReadiness = null;
      this._planningOutcomes = null;
      this._effectiveStrategies = null;
      this._strategyProfiles = null;
      this._outlookHorizons = null;
      this._meteringHorizons = null;
      this._meteringPeriods = null;
      this._meteringRemediations = null;
      this._visualRegistry = null;
    }
    rawState(entityId) { return this.hass?.states?.[entityId] || null; }
    subscriptionEntityIds() {
      const registryEntity = String(this.visualRegistry()?.entityId || '');
      return [...new Set([UX_INTERFACES.publicV2, registryEntity].filter(Boolean))];
    }
    entitySignature(entityIds = []) {
      return (entityIds || []).map(id => {
        const state = this.rawState(id);
        return `${id}:${state?.state ?? ''}:${state?.last_updated ?? ''}`;
      }).join('|');
    }
    gasStatisticsEntityId(assetId = '') {
      const v2 = this.publicV2();
      const row = v2.property('gas.total_m3', assetId) || v2.property('gas.total_m3');
      if (!row || typeof row !== 'object') return '';
      return String(firstDefined(
        row.statistics_entity_id,
        row.history_entity_id,
        row.source_entity_id,
        row.source?.entity_id,
        ''
      ) || '').trim();
    }
    visualRegistry() {
      if (!this._visualRegistry) this._visualRegistry = readFoundationVisualRegistry(this.hass);
      return this._visualRegistry;
    }
    resolveVisualRef(visualRef, variant = 'card') {
      return resolveEnergyVisualRef(visualRef, this.visualRegistry(), variant);
    }
    sourceAssetNavigation(asset = {}) {
      if (typeof rhiUxResolveDomainAssetNavigation !== 'function') return '';
      const assetId = String(firstDefined(asset.asset_id, asset.id, asset.raw?.asset_id, '') || '').trim();
      const visualRef = String(firstDefined(asset.visual_ref, asset.visualRef, asset.raw?.visual_ref, '') || '').trim();
      const registryOwner = visualRef ? String(this.visualRegistry()?.entry?.(visualRef)?.owner_domain || '').trim() : '';
      const ownerDomain = String(firstDefined(
        asset.producer_domain,
        asset.source_domain,
        asset.visual_owner_domain,
        registryOwner,
        ''
      ) || '').trim();
      if (!assetId || !ownerDomain || ['rhi_energy','rhi_energy_ux'].includes(ownerDomain)) return '';
      return rhiUxResolveDomainAssetNavigation(ownerDomain, assetId);
    }
    releaseState() { return this.rawState(RELEASE_ENTITY); }
    releaseAttrs() { return this.releaseState()?.attributes || {}; }
    publicUxEntities() {
      if (!this._allowed) this._allowed=[UX_INTERFACES.publicV2];
      return this._allowed;
    }
    isCanonicalUxInterface(entityId) {
      // The canonical interface is defined by its exact published entity id and
      // validated contract_id/core contract in readEnergyPublicV2(). Do not add
      // optional transport metadata as a second availability gate.
      return entityId === UX_INTERFACES.publicV2 && !!this.rawState(entityId);
    }
    isAllowed(entityId) {
      return entityId === RELEASE_ENTITY || this.isCanonicalUxInterface(entityId);
    }
    state(entityId) { return this.isAllowed(entityId) ? this.rawState(entityId) : null; }
    attrs(entityId) { return this.state(entityId)?.attributes || {}; }
    contractGateway() { return createEnergyContractGateway(this); }
    interfaceEntity(interfaceKey) {
      return interfaceKey === 'publicV2' && this.isCanonicalUxInterface(UX_INTERFACES.publicV2)
        ? UX_INTERFACES.publicV2
        : null;
    }
    entityForKey(_key) { return UX_INTERFACES.publicV2; }
    rowsForEntity(entityId) {
      return entityId === UX_INTERFACES.publicV2 ? this.propertyRows() : [];
    }
    allRows() {
      if (this._rows) return this._rows;
      const v2 = this.publicV2();
      const result = new Map();
      const add = row => {
        const key = String(row?.property_id || row?.property_key || row?.key || '');
        if (!key || result.has(key)) return;
        result.set(key, {
          entity_id:v2.envelope.entityId,
          ...row,
          property_id:String(row.property_id || key),
          property_key:key,
          key
        });
      };
      // Core is the only authority for current home-energy facts. Insert Core
      // before object/configuration rows because add() intentionally preserves the
      // first owner of a global property key. Asset-specific detail remains
      // available through propertyByAssetAndKey and assetField().
      for (const [key, field] of (v2.coreByKey || new Map()).entries()) {
        add({
          asset_id:'core',
          property_id:key,
          property_key:key,
          key,
          value:field.value,
          unit:field.unit,
          availability:field.status,
          status:field.status,
          quality:field.quality,
          reason:field.reason,
          source_type:'canonical_v2_core'
        });
      }
      (v2.allPropertyRows || []).forEach(add);

      // Preserve the existing view API without creating another truth source:
      // intelligence fields are direct projections of the canonical V2 object.
      Object.entries(v2.intelligence || {}).forEach(([key,value]) => add({
        asset_id:'energy_intelligence',
        property_id:`energy_intelligence.${key}`,
        property_key:`energy_intelligence.${key}`,
        key:`energy_intelligence.${key}`,
        value,
        availability:value === undefined || value === null ? 'UNAVAILABLE' : 'AVAILABLE',
        quality:'authoritative',
        source_type:'canonical_v2_intelligence'
      }));
      this._rows = result;
      return result;
    }
    propertyRows() { return [...this.allRows().values()]; }
    row(key) {
      const wanted=String(key || '');
      return this.allRows().get(wanted)
        || { key:wanted, property_id:wanted, property_key:wanted, value:null, unit:'', health:'NOT_PUBLISHED', quality:'missing', missing:true };
    }
    editablePropertyRows() {
      return (this.publicV2().allPropertyRows || [])
        .filter(row => row?.editable === true || row?.write_supported === true || row?.write?.supported === true)
        .map(row => ({
          entity_id:this.publicV2().envelope.entityId,
          ...row,
          key:String(row.property_id || row.property_key || row.key || ''),
          property_key:String(row.property_key || row.property_id || row.key || ''),
          property_id:String(row.property_id || row.property_key || row.key || '')
        }));
    }
    editableProperty(propertyId) {
      const wanted=String(propertyId || '');
      return this.editablePropertyRows().find(row => String(row.property_id || row.key || row.property_key || '') === wanted) || null;
    }
    value(key, fallback = null) { return rowValue(this.row(key), fallback); }
    number(key) { return asNumber(this.value(key, null)); }
    text(key, fallback = '—') { return human(this.value(key, fallback), fallback); }
    rawText(key, fallback = '') {
      const v = this.value(key, fallback);
      return v === undefined || v === null || v === '' ? fallback : String(v);
    }
    release() {
      const attrs = this.releaseAttrs();
      return {
        ux_version: UX_VERSION,
        backend_release: attrs.backend_release || 'unknown',
        contract_version: attrs.contract_version || 'unknown',
        release_contract_entity: RELEASE_ENTITY,
        governance_gate: attrs.governance_gate || attrs.health || this.releaseState()?.state || 'unknown',
        public_ux_entities_json: this.publicUxEntities()
      };
    }
    backendStatus() {
      // Product trust is owned by the canonical public V2 transport. Optional
      // diagnostic/release entities must never create a product-facing error.
      const v2 = this.publicV2();
      return {
        runtimeTrusted: v2.available === true,
        showMainWarning: false,
        failedHardGates: [],
        diagnosticsNotes: [],
        statusText: v2.available
          ? 'Canonical Energy contract active'
          : (v2.compatibilityReason || 'Canonical Energy contract unavailable'),
        warningText: ''
      };
    }
    footerModel() {
      const v2 = this.publicV2();
      const backendStatus = this.backendStatus();
      return {
        uxVersion: UX_VERSION,
        backendVersion: v2.release || 'Unknown',
        releaseContractEntity: UX_INTERFACES.publicV2,
        contractVersion: v2.contractVersion || 'Unknown',
        runtimeTrusted: backendStatus.runtimeTrusted,
        failedHardGates: [],
        diagnosticsNotes: [],
        statusText: backendStatus.statusText,
        warningText: '',
        showMainWarning: false
      };
    }
    publicV2() {
      if (!this._publicV2) this._publicV2 = readEnergyPublicV2(this.contractGateway());
      return this._publicV2;
    }
    experiencePresence() {
      return Object.freeze({...(this.publicV2().presence || {})});
    }
    contractCompatibility() {
      const v2=this.publicV2();
      return Object.freeze({
        available:v2.available === true,
        reason:String(v2.compatibilityReason || ''),
        release:String(v2.release || ''),
        contractVersion:String(v2.contractVersion || ''),
        capabilities:v2.capabilities || {}
      });
    }
    contractEntityId() { return this.publicV2().envelope.entityId; }
    assetProjection(assetId) { return selectEnergyAsset(this.publicV2(), assetId); }
    overviewProjection() { return selectEnergyOverview(this.publicV2()); }
    planningProjection(horizon = 'D0') { return selectEnergyPlanning(this.publicV2(), horizon); }
    strategyProjection() { return selectEnergyStrategies(this.publicV2()); }
    pricingProjection() { return selectEnergyPricing(this.publicV2()); }
    valueProjection(period = 'today') { return selectEnergyValue(this.publicV2(), period); }
    meteringProjection(period = 'today') { return selectEnergyMetering(this.publicV2(), period); }
    activityProjection() { return selectEnergyActivity(this.publicV2()); }
    commandProjection(assetId = '') { return selectEnergyCommands(this.publicV2(), assetId); }
    coverage() { return selectEnergyCoverage(this.publicV2()); }
    assets() {
      if (this._assets) return this._assets;
      const v2 = this.publicV2();
      this._assets = v2.available ? [...v2.objects] : [];
      return this._assets;
    }
    asset(assetId) { return this.assets().find(a => String(a.asset_id || '') === String(assetId)) || null; }
    assetName(assetId) { return this.asset(assetId)?.display_name || human(assetId, '—'); }
    assetField(assetId, propertyKey) {
      return this.publicV2().field(String(propertyKey || ''), String(assetId || ''));
    }
    assetValue(assetId, propertyKey, fallback = null) {
      const field = this.assetField(assetId, propertyKey);
      return field?.resolved === true ? field.value : fallback;
    }
    assetNumber(assetId, propertyKey) {
      return asNumber(this.assetValue(assetId, propertyKey, null));
    }
    assetText(assetId, propertyKey, fallback = '') {
      const value = this.assetValue(assetId, propertyKey, fallback);
      return value === undefined || value === null || value === '' ? fallback : String(value);
    }
    childrenOfType(parentAssetId, childType = '') {
      const wanted = String(childType || '').toLowerCase();
      return this.containsChildren(parentAssetId).filter(id => {
        if (!wanted) return true;
        const asset = this.asset(id) || {};
        return [asset.asset_type, asset.object_class].some(value => String(value || '').toLowerCase() === wanted);
      });
    }
    commandContract() {
      if (!this._commandContract) this._commandContract = readEnergyCommandContract(this.contractGateway());
      return this._commandContract;
    }
    commands() { return this.commandProjection().rows.map(row => this.commandContract().rows.find(candidate => candidate.command_id === row.command_id && candidate.target_asset_id === row.target_asset_id) || row); }
    commandVisible(command) { return !!command && command.command_resolved === true && command.visible === true; }
    commandResolved(command) { return !!command && command.command_resolved === true; }
    commandApplicable(command) { return !!command && command.currently_applicable === true; }
    commandEnabled(command) { return !!command && command.enabled === true; }
    commandReasonObject(command) { return objectFrom(command?.reason || {}); }
    commandReason(command) {
      const model = createCommandActionModel(command);
      return model?.reason || 'Currently unavailable';
    }
    commandReasonCode(command) { return String(this.commandReasonObject(command).code || ''); }
    commandRole(command) { return String(command?.role || '').toLowerCase(); }
    commandsForAsset(assetId) { return this.commands().filter(command => String(command.target_asset_id || '') === String(assetId)); }
    commandForAssetRole(assetId, role) {
      const wanted = String(role || '').toLowerCase();
      return this.commandsForAsset(assetId).find(command => this.commandRole(command) === wanted && this.commandVisible(command)) || null;
    }
    commandActionModelsForAsset(assetId) { return commandActionModelsForAsset(this.commandContract(), assetId); }
    visibleCommands(targetAssetId = null) {
      return this.commands().filter(command => this.commandVisible(command) && (!targetAssetId || String(command.target_asset_id || '') === String(targetAssetId)));
    }
    activities() {
      if (!this._activities) this._activities = [...this.activityProjection().rows];
      return this._activities;
    }
    activity(type) { return this.activities().find(a => String(a.activity_type || '').toLowerCase() === String(type).toLowerCase()) || null; }
    decision() {
      const d = this.value('energy_intelligence.decision', null);
      if (d && typeof d === 'object') return d;
      return {
        goal: this.value('energy_intelligence.goal', ''),
        observation: this.value('energy_intelligence.observation', ''),
        assessment: this.value('energy_intelligence.assessment', ''),
        recommendation: this.value('energy_intelligence.recommendation', ''),
        automation_mode: this.value('energy_intelligence.automation_mode', ''),
        automation_status: this.value('energy_intelligence.automation_status', ''),
        status: this.value('energy_intelligence.status', ''),
        reason: this.value('energy_intelligence.reason', ''),
        confidence: this.value('energy_intelligence.confidence', ''),
        affected_assets: this.value('energy_intelligence.affected_assets', []),
        next_review: this.value('energy_intelligence.next_review', '')
      };
    }
    overviewExperience() {
      const projection=this.overviewProjection();
      return projection.available ? { entity_id:this.contractEntityId(), ...projection.raw } : null;
    }
    pilotReadiness() {
      const v2=this.publicV2();
      const coverage=this.coverage();
      return {
        entity_id:v2.envelope.entityId,
        state:v2.available ? (coverage.complete ? 'READY' : 'PARTIAL') : 'UNAVAILABLE',
        contract_id:'RHI_ENERGY_PUBLIC_CONTRACT_V2',
        contract_version:v2.contractVersion,
        release:v2.release,
        coverage
      };
    }
    planningExperienceRows() {
      if (this._planningExperienceRows) return this._planningExperienceRows;
      const v2=this.publicV2();
      this._planningExperienceRows=(v2.layers?.planning_objects || []).map((row,index)=>({
        experience_id:row.experience_id || row.id || row.asset_id || `planning_experience_${index+1}`,
        entity_id:v2.envelope.entityId,
        ...objectFrom(row)
      }));
      return this._planningExperienceRows;
    }
    planningExperienceFor(assetId) {
      return this.planningExperienceRows().find(row => String(row.asset_id || row.target_asset_id || '') === String(assetId)) || null;
    }
    consumerMixIndexEntity() { return this.publicV2().envelope.entityId; }
    consumerMixRows() {
      if (this._consumerMixRows) return this._consumerMixRows;
      const v2=this.publicV2();
      this._consumerMixRows=(v2.flexibleAssets || []).map((raw,index)=>{
        const row=objectFrom(raw);
        const assetId=String(row.asset_id || `flexible_${index+1}`);
        const projected=this.assetProjection(assetId);
        const power=asNumber(projected?.property?.('power_kw')?.value ?? row.power_kw);
        const need=asNumber(projected?.property?.('energy_to_target_kwh')?.value ?? row.energy_to_target_kwh);
        return {
          mix_row_id:assetId,
          entity_id:v2.envelope.entityId,
          ...row,
          asset_id:assetId,
          display_name:row.display_name || this.assetName(assetId),
          category:row.asset_type || row.object_class || 'flexible_asset',
          controllability:'FLEXIBLE',
          current_power_kw:power,
          energy_today_kwh:null,
          energy_need_kwh:need,
          availability:row.availability_state || row.health || 'UNAVAILABLE',
          visible:true,
          flexible:true,
          source_refs:['RHI_ENERGY_PUBLIC_CONTRACT_V2.objects'],
          metering_state:'UNAVAILABLE',
          metering_reason:'Canonical per-asset period energy is not published by the current public contract.'
        };
      });
      return this._consumerMixRows;
    }
    consumerMixSummary() {
      if (this._consumerMixSummary) return this._consumerMixSummary;
      const rows=this.consumerMixRows();
      const power=rows.map(row=>asNumber(row.current_power_kw));
      const need=rows.map(row=>asNumber(row.energy_need_kwh)).filter(value=>value!==null);
      this._consumerMixSummary={
        current_power_kw:power.length && power.every(value=>value!==null) ? power.reduce((sum,value)=>sum+value,0) : null,
        known_energy_need_kwh:need.length ? need.reduce((sum,value)=>sum+value,0) : null,
        asset_count:rows.length,
        energy_kwh:null,
        energy_by_asset_kwh:{},
        health:'PARTIAL',
        reason:'Canonical current flexible-asset truth is available; category/per-asset period energy is not published by the current public contract.',
        source_refs:['RHI_ENERGY_PUBLIC_CONTRACT_V2.objects']
      };
      return this._consumerMixSummary;
    }
    consumerRows() {
      return this.assets().filter(a => String(a.asset_type || '') === 'consumer' && String(a.parent_asset_id || '') === 'consumer').map(asset => {
        const id = asset.asset_id;
        return {
          ...asset,
          current_power_kw: this.number(`${id}.power_kw`) ?? this.number(`${id}.current_power_kw`) ?? this.number(`${id}.actual_power_kw`),
          active: asBool(this.value(`${id}.active`, false)),
          enabled: asBool(this.value(`${id}.enabled`, false)),
          flexibility_available: asBool(this.value(`${id}.flexibility_available`, false)),
          connected: asBool(this.value(`${id}.connected`, false)),
          charging: asBool(this.value(`${id}.charging`, false)),
          min_power_kw: this.number(`${id}.min_power_kw`),
          max_power_kw: this.number(`${id}.max_power_kw`),
          effective_charger: this.value(`${id}.effective_charger`, ''),
          health: this.value(`${id}.health`, this.row(`${id}.health`).health || 'UNKNOWN')
        };
      });
    }

    flexibleRuntimePropertyRow(assetId, names) {
      const exact = [];
      names.forEach(name => {
        exact.push(`${assetId}.${name}`);
        exact.push(`${assetId}.${name.replace(/^energy_control_/, '')}`);
      });
      const direct = exact.map(key => this.row(key)).find(r => r && !r.missing);
      if (direct) return direct;
      const rows = this.propertyRows().filter(row => String(row.asset_id || '') === String(assetId));
      return rows.find(row => names.some(name => String(row.key || row.property_key || '').toLowerCase().endsWith(`.${name.toLowerCase()}`) || String(row.key || row.property_key || '').toLowerCase() === name.toLowerCase())) || { missing: true };
    }
    isDeprecatedTargetEnergyAlias(row) {
      if (!row || row.missing) return false;
      const text = `${row.key || row.property_key || ''} ${row.quality || ''} ${row.source_type || ''} ${row.resolution_mode || ''} ${row.alias_of || ''} ${row.deprecated_alias_of || ''} ${row.migration_role || ''}`.toLowerCase();
      return /deprecated|source_alias|derived_alias|alias/.test(text);
    }
    targetEnergyForAsset(assetId, sourceRow = {}) {
      const canonical = this.flexibleRuntimePropertyRow(assetId, ['energy_to_target_kwh']);
      if (canonical && !canonical.missing) return rowValue(canonical, null);
      if (sourceRow && sourceRow.energy_to_target_kwh !== undefined) return asNumber(sourceRow.energy_to_target_kwh);
      const aliases = [this.flexibleRuntimePropertyRow(assetId, ['remaining_energy_kwh']), this.flexibleRuntimePropertyRow(assetId, ['energy_needed_kwh'])];
      for (const row of aliases) {
        if (row && !row.missing && this.isDeprecatedTargetEnergyAlias(row)) return rowValue(row, null);
      }
      const rowText = `${sourceRow.alias_of || ''} ${sourceRow.deprecated_alias_of || ''} ${sourceRow.migration_role || ''} ${sourceRow.source_type || ''}`.toLowerCase();
      if (/deprecated|source_alias|derived_alias|alias/.test(rowText)) return asNumber(sourceRow.remaining_energy_kwh ?? sourceRow.energy_needed_kwh);
      return null;
    }
    normalizeFlexibleAssetRow(row) {
      const id = row.asset_id || row.flexible_asset_id || row.target_asset_id;
      // R1.59.4AKL: active flexible-load/runtime path is canonical-only.
      // Use power_kw + energy_flow_direction. Legacy actual/current power aliases are not active UX truth.
      const actual = this.number(`${id}.power_kw`) ?? asNumber(row.power_kw);
      const targetEnergy = this.targetEnergyForAsset(id, row);
      const remaining = this.number(`${id}.remaining_energy_kwh`) ?? asNumber(row.remaining_energy_kwh);
      const required = this.number(`${id}.required_energy_kwh`) ?? asNumber(row.required_energy_kwh);
      const requestedEffective = this.number(`${id}.requested_power_kw_effective`) ?? this.number(`${id}.requested_power_kw`) ?? asNumber(row.requested_power_kw_effective ?? row.requested_power_kw);
      return {
        ...row,
        asset_id: id,
        display_name: row.display_name || this.assetName(id),
        ux_asset_type: row.ux_asset_type || row.asset_type || (String(row.flexible_role || '').includes('storage') ? 'storage' : 'flexible_asset'),
        flexible_role: row.flexible_role || (String(row.asset_type || '').toLowerCase().includes('storage') ? 'storage' : 'load'),
        cluster_role: row.cluster_role || 'standalone',
        show_in_primary_ux: row.show_in_primary_ux ?? true,
        show_in_engineering: row.show_in_engineering ?? false,
        planning_enabled: row.planning_enabled ?? true,
        contributor_asset_ids: asArray(row.contributor_asset_ids),
        actual_power_kw: actual,
        current_power_kw: actual,
        power_kw: actual,
        energy_flow_direction: this.value(`${id}.energy_flow_direction`, row.energy_flow_direction || 'unknown'),
        power_direction: this.value(`${id}.energy_flow_direction`, row.energy_flow_direction || 'unknown'),
        energy_to_target_kwh: targetEnergy,
        remaining_energy_kwh: remaining,
        required_energy_kwh: required,
        energy_needed_kwh: targetEnergy,
        requested_power_kw_effective: requestedEffective,
        min_power_kw: this.number(`${id}.min_power_kw`) ?? asNumber(row.min_power_kw),
        max_power_kw: this.number(`${id}.max_power_kw`) ?? asNumber(row.max_power_kw),
        energy_control_priority: this.value(`${id}.energy_control_priority`, row.energy_control_priority ?? row.priority ?? 'normal'),
        availability_state: this.value(`${id}.availability_state`, row.availability_state || 'unknown'),
        availability_reason: this.value(`${id}.availability_reason`, row.availability_reason || ''),
        operating_state: this.value(`${id}.operating_state`, row.operating_state || 'unknown'),
        energy_control_hold_state: this.value(`${id}.energy_control_hold_state`, row.energy_control_hold_state || 'none'),
        energy_control_mode: this.value(`${id}.energy_control_mode`, row.energy_control_mode || row.current_mode || 'advice'),
        can_execute_energy_action_now: asBool(this.value(`${id}.can_execute_energy_action_now`, row.can_execute_energy_action_now), false),
        energy_planning: this.planningOutcomeFor(id),
        // Canonical producer-owned charging relation aliases. These are
        // presentation conveniences only; the values remain Mobility-owned.
        effective_charger: firstDefined(
          row.effective_charger,
          row.effective_connection_id,
          row.assigned_connection_id,
          row.physical_connection_id,
          row.charger_asset_id,
          row.connection_asset_id,
          ''
        ),
        charger_asset_id: firstDefined(
          row.charger_asset_id,
          row.effective_connection_id,
          row.assigned_connection_id,
          row.physical_connection_id,
          row.connection_asset_id,
          ''
        )
      };
    }
    flexibleAssetIndexRows() {
      if (this._flexibleAssets) return this._flexibleAssets;
      const v2=this.publicV2();
      this._flexibleAssetSource='RHI_ENERGY_PUBLIC_CONTRACT_V2.flexible_assets';
      this._flexibleAssets=(v2.flexibleAssets || []).map(row=>this.normalizeFlexibleAssetRow({
        ...row,
        compatibility_fallback:false,
        contract_source:v2.envelope.entityId
      })).filter(row=>row.asset_id);
      return this._flexibleAssets;
    }
    primaryFlexibleAssets() {
      // R1.59.4AKL / R3.45.16: Solar and Consumers must use the same
      // broad Flexible Loads interpretation. The projection is already the
      // UX-safe list of Energy-controllable flexible-load assets and may
      // include the battery storage cluster. Do not restrict Solar to
      // ux_asset_type=flexible_load, Mobility/vehicle assets, or a narrow
      // cluster_role list; that hides storage_cluster rows. Visibility is
      // controlled by the projection flags only.
      return this.flexibleAssetIndexRows().filter(asset => {
        const visible = asset.visible !== undefined
          ? asBool(asset.visible, true)
          : asBool(asset.show_in_primary_ux, true);
        const showPrimary = asset.show_in_primary_ux !== undefined
          ? asBool(asset.show_in_primary_ux, true)
          : true;
        return visible && showPrimary;
      });
    }
    commandReadinessRows() {
      return this.commands();
    }
    readinessFor(assetId, role) {
      return this.commandForAssetRole(assetId, role);
    }
    commandFromReadiness(assetId, role) {
      return this.commandForAssetRole(assetId, role);
    }

    planningIndexRows() {
      if (this._planningOutcomes) return this._planningOutcomes;
      const v2=this.publicV2();
      this._planningOutcomes=(v2.layers?.planning_objects || [])
        .map((row,i)=>({
          planning_id:row.planning_id || row.id || row.plan_id || `planning_${i+1}`,
          entity_id:v2.envelope.entityId,
          ...objectFrom(row),
          asset_id:row.asset_id || row.target_asset_id || row.flexible_asset_id || row.planning_target_asset_id
        }))
        .filter(row=>row.asset_id);
      return this._planningOutcomes;
    }
    planningOutcomeFor(assetId) {
      return this.planningIndexRows().find(row => String(row.asset_id || '') === String(assetId || '')) || null;
    }

    planningHorizons() {
      const planning=this.publicV2().planning || {};
      const horizons=planning.horizons && typeof planning.horizons === 'object' ? planning.horizons : {};
      return Object.entries(horizons).map(([id,value])=>({ horizon_id:String(id).toUpperCase(), ...planningObject(value) }));
    }
    planningHorizon(id = 'D0') {
      return this.planningProjection(id).horizon || null;
    }
    planningHorizonTotals(id = 'D0') {
      return this.planningProjection(id).lane_totals;
    }
    planningBuckets(id = 'D0') {
      return this.planningProjection(id).buckets;
    }

    relationships() {
      return this.publicV2().available ? [...this.publicV2().relationships] : [];
    }
    flowRelationships() {
      return this.relationships().filter(r => String(r.relationship_type || '').toLowerCase() === 'flows_to');
    }
    connectedRelationships() {
      return this.relationships().filter(r => String(r.relationship_type || '').toLowerCase() === 'connected_to');
    }
    containsChildren(parentAssetId) {
      const relChildren = this.relationships()
        .filter(r => String(r.relationship_type || '').toLowerCase() === 'contains' && String(r.source_asset_id || r.from_asset_id || '') === String(parentAssetId))
        .map(r => String(r.target_asset_id || r.to_asset_id || '')).filter(Boolean);
      const assetChildren = this.assets().filter(a => String(a.parent_asset_id || '') === String(parentAssetId)).map(a => String(a.asset_id || '')).filter(Boolean);
      return [...new Set([...relChildren, ...assetChildren])];
    }
    powerForAsset(assetId) {
      const id = String(assetId || '');
      const asset = this.asset(id) || {};
      const type = String(asset.asset_type || asset.object_class || '').toLowerCase();
      const candidatesByType = {
        battery: ['battery.power_kw','battery.charge_power_kw','battery.discharge_power_kw'],
        inverter: ['inverter.power_kw','solar.power_kw'],
        solar_inverter: ['solar.power_kw','inverter.power_kw'],
        grid_phase: ['grid_phase.power_kw'],
        flexible_load: ['flexible_load.power_kw','flexible_load.current_power_kw']
      };
      const candidates = candidatesByType[type] || ['power_kw'];
      for (const key of candidates) {
        const n = this.assetNumber(id, key);
        if (n !== null) return n;
      }
      return null;
    }
    rowsByAsset(assetId) {
      return [...this.allRows().values()].filter(row => String(row.asset_id || '') === String(assetId));
    }
    rowsByPrefix(prefix) {
      const p = String(prefix || '');
      return [...this.allRows().values()].filter(row => String(row.key || '').startsWith(p));
    }
    editableRows() {
      return [...this.allRows().values()].filter(row => asBool(row.editable, false) || String(row.access || '').toLowerCase() === 'editable');
    }
    strategyIntentRows() { return []; }
    strategyProfileRows() {
      if (this._strategyProfiles) return this._strategyProfiles;
      const v2=this.publicV2();
      // Settings grouping is Energy-owned. UX consumes the published groups and
      // never rebuilds them from property-name/group heuristics.
      this._strategyProfiles=asArray(v2.configuration?.strategy?.profiles).map(raw=>{
        const profile=objectFrom(raw);
        const profileId=String(profile.profile_id || '');
        const configured=asArray(profile.configured_properties).map(row=>({
          entity_id:v2.envelope.entityId,
          ...objectFrom(row),
          profile_id:profileId,
          strategy_profile_id:profileId
        }));
        return {
          ...profile,
          strategy_id:profileId,
          profile_id:profileId,
          profile_type:profileId,
          asset_type:profileId,
          profile_label:profile.display_name || human(profileId),
          display_name:profile.display_name || human(profileId),
          entity_id:v2.envelope.entityId,
          contract_role:'editable_strategy_profile',
          editable_field_rows:configured.filter(row=>canonicalEditableProperty(row)),
          properties:configured,
          effective_properties:asArray(profile.effective_properties)
        };
      }).filter(profile=>profile.profile_id);
      return this._strategyProfiles;
    }
    strategyProfileFor(profileId) {
      const wanted = String(profileId || '').toLowerCase();
      if (!wanted) return null;
      return this.strategyProfileRows().find(row => String(row.profile_id || '').toLowerCase() === wanted || String(row.profile_type || '').toLowerCase() === wanted || String(row.asset_type || '').toLowerCase() === wanted) || null;
    }
    strategyProfileEditableFieldRows(profile = {}) {
      const profileId=String(profile.profile_id || profile.strategy_profile_id || '').trim().toLowerCase();
      if (!profileId) return [];
      const labels={
        objective:'Objective', surplus_objective:'Objective', reserve_target_pct:'Minimum reserve',
        minimum_target_value:'Minimum target', preferred_target_value:'Preferred target', maximum_useful_value:'Maximum useful',
        deadline:'Default deadline', deadline_time:'Default deadline', grid_policy:'Grid policy', solar_policy:'Solar policy',
        battery_policy:'Home Battery policy', surplus_policy:'Surplus policy', confidence_policy:'Confidence',
        minimum_run_minutes:'Minimum run time', minimum_off_minutes:'Minimum off time', adjust_deadband_kw:'Deadband'
      };
      return asArray(profile.editable_field_rows).map(row=>{
        const key=String(row.property_id || row.key || row.property_key || '');
        const suffix=key.split('.').pop();
        return {
          ...row,
          entity_id:this.publicV2().envelope.entityId,
          source_index:'RHI_ENERGY_PUBLIC_CONTRACT_V2.configuration.strategy',
          contract_role:'canonical_strategy_property',
          profile_id:profileId,
          strategy_profile_id:profileId,
          field_key:suffix,
          display_name:firstDefined(row.display_name,row.label,labels[suffix],human(suffix)),
          allowed_values:firstDefined(row.allowed_values,row.choices,objectFrom(row.constraints).allowed,[]),
          min:firstDefined(row.min,objectFrom(row.constraints).min,''),
          max:firstDefined(row.max,objectFrom(row.constraints).max,''),
          step:firstDefined(row.step,objectFrom(row.constraints).step,''),
          editable_reason:firstDefined(row.reason_text,row.reason_code,'Canonical public property is not writable')
        };
      });
    }
    strategyProfileEditableRowByKey(propertyKey) {
      const key = String(propertyKey || '');
      if (!key) return null;
      for (const profile of this.strategyProfileRows()) {
        const hit = this.strategyProfileEditableFieldRows(profile).find(row => String(row.key || row.property_key || '') === key);
        if (hit) return hit;
      }
      return null;
    }
    settingsParticipationRows() {
      const v2=this.publicV2();
      return asArray(v2.configuration?.strategy?.participating_assets)
        .map(row=>objectFrom(row))
        .filter(row=>row.asset_id);
    }
    effectiveStrategyRows() {
      if (this._effectiveStrategies) return this._effectiveStrategies;
      const v2=this.publicV2();
      const rows=asArray(v2.configuration?.strategy?.effective?.properties);
      const byGroup=new Map();
      rows.forEach(raw=>{
        const row=objectFrom(raw);
        const group=String(row.group || row.asset_id || 'home');
        const current=byGroup.get(group) || {
          strategy_id:group, policy_id:group, asset_id:group,
          entity_id:v2.envelope.entityId,
          contract_role:'effective_strategy_policy',
          effective_state:v2.configuration?.strategy?.effective?.status || 'UNAVAILABLE',
          reason_code:v2.configuration?.strategy?.effective?.reason || ''
        };
        const key=String(row.property_id || row.key || row.property_key || '');
        if(key) current[key]=row.value;
        current.properties=[...(current.properties || []),row];
        byGroup.set(group,current);
      });
      this._effectiveStrategies=[...byGroup.values()];
      return this._effectiveStrategies;
    }
    strategyBehaviorTopics() {
      const v2=this.publicV2();
      return asArray(v2.configuration?.strategy?.behavior_topics)
        .map(row=>objectFrom(row))
        .filter(row=>row.topic_id)
        .sort((a,b)=>(asNumber(a.display_order) ?? 999) - (asNumber(b.display_order) ?? 999));
    }
    effectiveStrategyFor(assetId) {
      return this.effectiveStrategyRows().find(row => String(row.asset_id || '') === String(assetId || '')) || null;
    }
    commandState(command) {
      if (!this.commandVisible(command)) return 'hidden';
      return this.commandEnabled(command) ? 'enabled' : 'disabled';
    }
    statusForKeys(keys) {
      const rows = asArray(keys).map(key => this.row(key));
      if (!rows.length) return 'unknown';
      const states = rows.map(row => rowState(row));
      if (states.includes('fail')) return 'fail';
      if (states.includes('warn')) return 'warn';
      if (states.every(s => s === 'missing')) return 'missing';
      if (states.includes('not-measured')) return 'not-measured';
      if (states.includes('unknown')) return 'unknown';
      return 'ok';
    }

    outlookHorizons() {
      if (!this._outlookHorizons) this._outlookHorizons=this.planningHorizons();
      return this._outlookHorizons;
    }
    meteringHorizons() {
      if (!this._meteringHorizons) {
        this._meteringHorizons=this.planningHorizons().map(row=>({ ...row, contract_kind:'metering_context' }));
      }
      return this._meteringHorizons;
    }
    meteringPeriods() {
      if (this._meteringPeriods) return this._meteringPeriods;
      const v2=this.publicV2();
      const periods=objectFrom(v2.metering?.periods || {});
      const labels={hour:'This hour',today:'Today',day:'Today',week:'This week',month:'This month',year:'This year'};
      const order={hour:0,today:1,day:1,week:2,month:3,year:4};
      this._meteringPeriods=Object.entries(periods).map(([period_id,raw])=>{
        const id=String(period_id).toLowerCase();
        const row=objectFrom(raw);
        return {
          entity_id:v2.envelope.entityId,
          period_id:id,
          label:labels[id] || human(id),
          selector_order:order[id] ?? 99,
          graph_support:false,
          bucket_support:false,
          ...row,
          summary:objectFrom(row.summary),
          measurement_state:String(firstDefined(row.measurement_state,row.availability,'UNAVAILABLE')),
          quality:String(firstDefined(row.quality,row.summary?.quality?.period,'UNKNOWN')),
          user_action_required:asBool(firstDefined(row.user_action_required,row.baseline_reset_required,false),false)
        };
      }).sort((a,b)=>(a.selector_order??99)-(b.selector_order??99));
      return this._meteringPeriods;
    }
    valuePeriods() {
      if (this._valuePeriods) return this._valuePeriods;
      const v2=this.publicV2();
      const periods=objectFrom(v2.valueAccounting?.periods || {});
      const order={today:1,day:1,week:2,month:3,year:4};
      const labels={today:'Today',day:'Today',week:'This week',month:'This month',year:'This year'};
      this._valuePeriods=Object.entries(periods).map(([period_id,row])=>({
        entity_id:v2.envelope.entityId,
        period_id:String(period_id).toLowerCase(),
        label:labels[String(period_id).toLowerCase()] || human(period_id),
        selector_order:order[String(period_id).toLowerCase()] || 99,
        summary:{ cost:objectFrom(row), quality:{ financial:row?.quality || 'UNKNOWN' } },
        ...objectFrom(row)
      })).sort((a,b)=>(a.selector_order||99)-(b.selector_order||99));
      return this._valuePeriods;
    }
    meteringRemediations() {
      if (this._meteringRemediations) return this._meteringRemediations;
      this._meteringRemediations=this.commands()
        .filter(command=>command.command_id === 'energy.command.reset_metering_baseline' && command.visible === true)
        .map(command=>({
          remediation_id:command.command_instance_id || command.command_row_id,
          period_id:String(command.period_id || '').toLowerCase(),
          command_id:command.command_id,
          command,
          applicable:true,
          requires_confirmation:command.requires_confirmation !== false
        }));
      return this._meteringRemediations;
    }
    meteringRemediationsForPeriod(periodId) {
      const wanted = String(periodId || '').toLowerCase();
      return this.meteringRemediations().filter(row => !row.period_id || !wanted || row.period_id === wanted);
    }
    meteringResetCommandFor(remediation = {}, periodId = '') {
      const commandId = String(firstDefined(remediation.command_id,remediation.command_ref,remediation.command_key,'') || '');
      if (!commandId) return null;
      return this.commands().find(command => String(command.command_id || '') === commandId && command.visible === true) || null;
    }
    meteringResetRemediationForPeriod(periodId = '') {
      return this.meteringRemediationsForPeriod(periodId)[0] || null;
    }

    commandBindingMismatches() {
      return this.commands().filter(command =>
        !command.command_id
        || !command.target_asset_id
        || !command.role
        || !command.invoke
        || typeof command.visible !== 'boolean'
        || typeof command.enabled !== 'boolean'
        || !command.label
        || (!command.enabled && !String(firstDefined(command.blocked_reason,command.user_action_text,'')))
      ).map(command => ({
        command_instance_id:command.command_instance_id || command.command_row_id || '',
        target_asset_id:command.target_asset_id || '',
        role:command.role || '',
        problem:'invalid_R1_89_39_public_command_shape'
      }));
    }

    coverageReport() {
      const rows = [...this.allRows().values()];
      return {
        release: this.release(),
        allowed_public_entities: this.publicUxEntities().length,
        assets: this.assets().length,
        properties: rows.length,
        commands: this.commands().length,
        activities: this.activities().length,
        relationships: this.relationships().length,
        strategy_profiles: this.strategyProfileRows().length,
        effective_strategies: this.effectiveStrategyRows().length,
        flow_relationships: this.flowRelationships().length,
        command_binding_mismatches: this.commandBindingMismatches(),
        connected_relationships: this.connectedRelationships().length,
        missing_core_keys: [
          'solar.power_kw','forecast.solar_today_kwh','forecast.next_hour_energy_kwh','battery.soc_pct','home_consumption.power_kw','energy_intelligence.recommendation'
        ].filter(key => this.row(key).missing)
      };
    }
  }

  const firstDefined = (...values) => values.find(value => value !== undefined && value !== null && value !== '');
  const objectFrom = (value) => {
    const parsed = parseMaybeJson(value, value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  };
  const splitService = (service) => {
    const text = String(service || '').trim();
    if (!text || !text.includes('.')) return { domain: '', action: '' };
    const [domain, ...rest] = text.split('.');
    return { domain, action: rest.join('.') };
  };
  const allowedValuesForRow = (row) => {
    if (!row || typeof row !== 'object') return [];
    const validation = objectFrom(row.validation);
    let values = firstDefined(row.allowed_values, row.allowedValues, row.options, row.choices, validation.allowed_values, validation.options, validation.choices);
    if (!values && typeof row.validation === 'string' && row.validation.includes('|')) values = row.validation.split('|');
    return asArray(values).map(v => (v && typeof v === 'object') ? (v.value ?? v.id ?? v.key ?? v.label ?? v.name) : v).filter(v => v !== undefined && v !== null && v !== '');
  };
  const coerceAllowedValue = (row, value) => {
    const allowed = allowedValuesForRow(row);
    if (!allowed.length) return value;
    const wanted = String(value ?? '').trim().toLowerCase();
    const hit = allowed.find(v => String(v).trim().toLowerCase() === wanted)
      || allowed.find(v => human(v, '').trim().toLowerCase() === wanted)
      || allowed.find(v => String(v).replace(/[\s_\-]+/g, '').toLowerCase() === wanted.replace(/[\s_\-]+/g, ''));
    return hit ?? value;
  };
  const valueAtPath = (source, path) => {
    if (!source || !path) return undefined;
    const parts = String(path).split('.').filter(Boolean);
    let current = source;
    for (const part of parts) {
      if (current === undefined || current === null || typeof current !== 'object') return undefined;
      current = current[part];
    }
    return current;
  };
  const renderTemplateValue = (value, context = {}) => {
    if (Array.isArray(value)) return value.map(item => renderTemplateValue(item, context));
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, renderTemplateValue(v, context)]));
    }
    if (typeof value !== 'string') return value;
    const replaced = value.replace(/{{\s*([a-zA-Z0-9_\.]+)\s*}}/g, (_, key) => {
      const direct = context[key];
      const nested = valueAtPath(context, key);
      const result = direct !== undefined ? direct : nested;
      return result === undefined || result === null ? '' : String(result);
    });
    return replaced;
  };
  const renderPayloadTemplate = (template, context = {}) => {
    if (template === undefined || template === null || template === '') return {};
    const parsed = parseMaybeJson(template, template);
    const rendered = renderTemplateValue(parsed, context);
    if (typeof rendered === 'string') return objectFrom(parseMaybeJson(rendered, {}));
    return objectFrom(rendered);
  };


  // ---- src/domain/models/flexible-asset-model.js ----
class FlexibleAssetDomainModel {
    constructor(runtime) {
      this.runtime = runtime;
      this._all = null;
      this._byId = null;
    }
    assetContext(asset = {}) {
      const id = String(firstDefined(asset.asset_id, asset.flexible_asset_id, asset.target_asset_id, ''));
      if (!id || typeof readEnergyAssetContext !== 'function') return { available:false, asset:null, profile:null, publication:null };
      return readEnergyAssetContext(this.runtime.contractGateway(), id);
    }
    isInfrastructure(asset = {}) {
      const sourceContext = asset.source_context && typeof asset.source_context === 'object' ? asset.source_context : {};
      const mobilityContext = sourceContext.mobility && typeof sourceContext.mobility === 'object' ? sourceContext.mobility : {};
      const values = [
        asset.participation_state,
        asset.source_asset_kind,
        asset.asset_type,
        asset.object_class,
        asset.energy_asset_role,
        mobilityContext.consumer_fallback
      ].map(value => String(value || '').trim().toLowerCase());
      return asset.infrastructure_only === true
        || values.includes('infrastructure_only')
        || values.includes('unassigned_charger')
        || values.includes('charger')
        || values.includes('connection');
    }
    isStorage(asset = {}) {
      const context = this.assetContext(asset);
      const values = [
        context.asset?.asset_type,
        context.profile?.asset_type,
        asset.energy_asset_role,
        asset.asset_type,
        asset.ux_asset_type,
        asset.flexible_role,
        asset.category
      ].map(value => String(value || '').trim().toLowerCase()).filter(Boolean);
      return values.some(value => ['battery','battery_system','storage','storage_cluster'].includes(value));
    }
    planningFor(assetId) {
      return this.runtime.planningOutcomeFor(assetId) || {};
    }
    participationState(asset = {}, planning = {}) {
      if (this.isStorage(asset)) return 'storage';
      if (this.isInfrastructure(asset)) return 'infrastructure_only';
      const context = this.assetContext(asset);
      const explicit = String(firstDefined(
        context.asset?.participation_state,
        asset.participation_state,
        asset.automation_participation,
        asset.planning_participation,
        ''
      ) || '').trim().toLowerCase();
      if (['disabled','excluded','off','not_participating','not participating'].includes(explicit)) return 'disabled';
      if (['participating','enabled','active'].includes(explicit)) {
        const availability = String(firstDefined(context.asset?.availability_state, asset.availability_state, '') || '').trim().toLowerCase();
        return ['unavailable','disconnected','offline','blocked'].includes(availability) ? 'temporarily_unavailable' : 'participating';
      }
      const lifecycle = String(firstDefined(asset.lifecycle_state, asset.lifecycle_status, '') || '').trim().toLowerCase();
      if (['disabled','inactive'].includes(lifecycle)) return 'disabled';
      return 'unknown';
    }
    operationalState(asset = {}, planning = {}) {
      const context = this.assetContext(asset);
      const raw = String(firstDefined(
        context.asset?.operating_state,
        asset.operating_state,
        asset.operation_state,
        planning.product_state,
        planning.state,
        planning.status,
        ''
      ) || '').trim().toLowerCase();
      const aliases = {
        charging:'active', running:'active', executing:'active',
        selected:'planned', pending:'waiting',
        offline:'unavailable', disconnected:'unavailable', blocked:'unavailable',
        hold:'paused'
      };
      const normalized = aliases[raw] || raw;
      return ['paused','starting','stopping','active','planned','waiting','unavailable','idle'].includes(normalized)
        ? normalized
        : 'unknown';
    }
    build(asset = {}) {
      const id = String(firstDefined(asset.asset_id, asset.flexible_asset_id, asset.target_asset_id, ''));
      const planning = this.planningFor(id);
      const context = this.assetContext(asset);
      // Materialize one UX asset from two canonical views of the same V2 object:
      // core.flexible.assets owns participation/planning semantics, while objects[]
      // carries richer producer identity such as visual_ref and charger linkage.
      // No semantic inference or cross-domain lookup is performed here.
      const materialized = context.asset
        ? {
            // Energy object context enriches the producer-owned flexible row.
            // Producer identity must win for visual_ref, asset kind and connection semantics.
            ...context.asset,
            ...asset,
            asset_id:id,
            visual_ref:String(firstDefined(asset.visual_ref, context.asset.visual_ref, '') || '')
          }
        : { ...asset, asset_id:id };
      const participation = this.participationState(materialized, planning);
      return {
        id,
        raw: materialized,
        planning,
        profile: context.profile,
        profileId: String(materialized.profile_id || context.profile?.profile_id || ''),
        publication: context.publication,
        visualRef: String(firstDefined(materialized.visual_ref, '') || ''),
        visual: typeof this.runtime.resolveVisualRef === 'function'
          ? this.runtime.resolveVisualRef(firstDefined(materialized.visual_ref, ''), 'card')
          : null,
        publicationGap: typeof energyAssetPublicationGap === 'function'
          ? energyAssetPublicationGap(this.runtime.contractGateway(), id)
          : { status:'unavailable', missing:[] },
        participation,
        operation: this.operationalState(materialized, planning),
        isStorage: participation === 'storage',
        isInfrastructure: participation === 'infrastructure_only',
        isDisabled: participation === 'disabled',
        isParticipating: participation === 'participating' || participation === 'temporarily_unavailable',
        isTemporarilyUnavailable: participation === 'temporarily_unavailable'
      };
    }
    all() {
      if (!this._all) {
        this._all = this.runtime.primaryFlexibleAssets().map(asset => this.build(asset));
        this._byId = new Map(this._all.map(vm => [vm.id, vm]));
      }
      return this._all;
    }
    byId(assetId) { this.all(); return this._byId.get(String(assetId)) || null; }
    consumerFacing() { return this.all().filter(vm => !vm.isStorage && !vm.isInfrastructure); }
    participating() { return this.consumerFacing().filter(vm => vm.isParticipating); }
    planningParticipants() {
      return this.participating().filter(vm => vm.raw?.planning_input_ready !== false);
    }
    disabled() { return this.consumerFacing().filter(vm => vm.isDisabled); }
    infrastructure() { return this.all().filter(vm => vm.isInfrastructure); }
    storage() { return this.all().filter(vm => vm.isStorage); }
    planningRows() {
      const published = new Map(this.runtime.planningIndexRows().map(row => [String(row.asset_id || row.consumer_id || row.id || ''), row]));
      return this.planningParticipants().map(vm => {
        const row = published.get(vm.id) || vm.planning || {};
        return {
          ...row,
          asset_id: vm.id,
          participation_state: vm.participation,
          operational_state: vm.operation,
          status: vm.operation,
          state: vm.operation,
          waiting: vm.operation === 'waiting',
          planned: vm.operation === 'planned',
          active: vm.operation === 'active',
          paused: vm.operation === 'paused'
        };
      });
    }
    summary() {
      const rows = this.planningRows();
      return {
        participating_count: rows.length,
        disabled_count: this.disabled().length,
        storage_count: this.storage().length,
        infrastructure_count: this.infrastructure().length,
        waiting_count: rows.filter(row => row.operational_state === 'waiting').length,
        planned_count: rows.filter(row => row.operational_state === 'planned').length,
        active_count: rows.filter(row => row.operational_state === 'active').length,
        paused_count: rows.filter(row => row.operational_state === 'paused').length,
        temporarily_unavailable_count: rows.filter(row => row.participation_state === 'temporarily_unavailable').length
      };
    }
    physicalFlowParticipants() {
      const relationships = this.runtime.connectedRelationships();
      const related = new Set();
      relationships.forEach(rel => {
        if (rel.from_asset_id) related.add(String(rel.from_asset_id));
        if (rel.to_asset_id) related.add(String(rel.to_asset_id));
      });
      return this.participating().filter(vm => {
        const asset = vm.raw || {};
        const measured = asNumber(firstDefined(asset.current_power_kw, asset.actual_power_kw, asset.power_kw, this.runtime.number(`${vm.id}.current_power_kw`), this.runtime.number(`${vm.id}.power_kw`))) || 0;
        const connectionState = String(firstDefined(asset.connection_state, '') || '').trim().toLowerCase();
        const connected = asBool(firstDefined(asset.connected, this.runtime.value(`${vm.id}.connected`, false)), false)
          || ['connected','asset_connected'].includes(connectionState);
        const charger = firstDefined(
          asset.effective_charger,
          asset.effective_connection_id,
          asset.assigned_connection_id,
          asset.physical_connection_id,
          asset.charger_asset_id,
          asset.connection_asset_id,
          asset.execution_target_asset_id,
          ''
        );
        return measured > 0.05 || connected || related.has(vm.id) || Boolean(charger) || (charger && related.has(String(charger)));
      });
    }
  }

  // ---- src/domain/planning/contract-adapter.js ----
// Canonical support is capability-based. R1.79.3 compatibility is deliberately bounded to the
// published bucket fields and must not become a second planning owner.
  function planningArray(value) {
    const parsed = parseMaybeJson(value, value);
    return Array.isArray(parsed) ? parsed : [];
  }

  function planningParticipantId(row = {}) {
    return String(firstDefined(row.participant_id, row.asset_id, row.target_asset_id, row.flexible_asset_id, ''));
  }

  function planningEnergyFromPower(row = {}, durationMinutes = 60) {
    const direct = asNumber(firstDefined(row.planned_demand_kwh, row.planned_supply_kwh, row.planned_energy_kwh, row.energy_kwh));
    if (direct !== null) return direct;
    const power = asNumber(firstDefined(row.planned_power_kw, row.power_kw, row.allocated_power_kw));
    return power === null ? null : power * Math.max(0, asNumber(durationMinutes) || 60) / 60;
  }

  function signedPlanningGrid(bucket = {}) {
    const signed = asNumber(firstDefined(bucket.grid_net_kwh, bucket.expected_grid_net_kwh, bucket.net_grid_kwh, bucket.grid_kwh));
    if (signed !== null) return { importKwh: Math.max(0, signed), exportKwh: Math.max(0, -signed) };
    return {
      importKwh: asNumber(firstDefined(bucket.expected_grid_import_kwh, bucket.grid_import_kwh)),
      exportKwh: asNumber(firstDefined(bucket.expected_grid_export_kwh, bucket.grid_export_kwh))
    };
  }

  function adaptPlanningBucket(bucket = {}, contractVersion = '') {
    const version = String(contractVersion || '');
    const isR1794 = ['advisory_source_lane','advisory_consumer_lane','advisory_boundary_flows','advisory_lane_balance_delta_kwh']
      .some(key => Object.prototype.hasOwnProperty.call(bucket, key));
    const isR1793 = version.includes('R1.79.3');
    if (!isR1794 && !isR1793) return { raw:bucket, id:String(firstDefined(bucket.bucket_id,bucket.id,'')), startTime:firstDefined(bucket.start_time,bucket.start,bucket.bucket_start,''), endTime:firstDefined(bucket.end_time,bucket.end,bucket.bucket_end,''), durationMinutes:asNumber(bucket.duration_minutes)||60, sources:[], consumers:[], boundary:{gridExportKwh:null}, balanceDeltaKwh:null, state:'unavailable', reason:'unsupported_planning_contract', confidence:'', forecastQuality:'', disclosure:'', canonicalLanes:false, contractSupported:false, contractFamily:'unsupported' };
    const durationMinutes = asNumber(bucket.duration_minutes) || 60;
    const canonicalSources = planningArray(bucket.advisory_source_lane);
    const canonicalConsumers = planningArray(bucket.advisory_consumer_lane);
    const hasCanonicalLanes = isR1794;
    let sources = canonicalSources;
    let consumers = canonicalConsumers;
    let boundary = objectFrom(parseMaybeJson(bucket.advisory_boundary_flows, bucket.advisory_boundary_flows || {}));

    if (!hasCanonicalLanes) {
      const grid = signedPlanningGrid(bucket);
      const allocations = planningArray(firstDefined(bucket.asset_allocations, bucket.asset_allocations_json, []));
      sources = [
        { participant_id:'solar', display_name:'Solar', participant_type:'producer', lane_role:'source', flow_direction:'production', planned_supply_kwh:asNumber(bucket.solar_forecast_kwh), planning_state:'forecast', forecast_quality:bucket.forecast_quality },
        { participant_id:'grid', display_name:'Grid', participant_type:'grid_connection', lane_role:'source', flow_direction:(grid.importKwh || 0) > 0 ? 'import' : 'idle', planned_supply_kwh:grid.importKwh, planning_state:(grid.importKwh || 0) > 0 ? 'residual_supply' : 'not_required' }
      ];
      consumers = [
        { participant_id:'home', display_name:'Home', participant_type:'fixed_consumer', lane_role:'consumer', flow_direction:'consume', planned_demand_kwh:asNumber(bucket.base_demand_forecast_kwh), planning_state:'forecast' },
        ...allocations.map(row => ({ ...row, participant_id:planningParticipantId(row), lane_role:'consumer', flow_direction:'charge', planned_demand_kwh:planningEnergyFromPower(row, durationMinutes), allocation_state:firstDefined(row.allocation_state, 'advisory') }))
      ];
      boundary = { grid_export_kwh:grid.exportKwh };
    }

    const normalize = (row, laneRole) => ({
      ...row,
      participantId: planningParticipantId(row),
      laneRole,
      energyKwh: planningEnergyFromPower(row, durationMinutes),
      powerKw: asNumber(firstDefined(row.planned_power_kw, row.power_kw, row.allocated_power_kw)),
      state: String(firstDefined(row.planning_state, row.state, row.status, '') || '').toLowerCase(),
      allocationState: String(firstDefined(row.allocation_state, '') || '').toLowerCase(),
      executionAllowed: firstDefined(row.plan_execution_allowed, null),
      reason: firstDefined(row.reason_label, row.user_reason_label, row.reason_code, row.reason, '')
    });
    const normalizedSources = sources.map(row => normalize(row, 'source'));
    const normalizedConsumers = consumers.map(row => normalize(row, 'consumer'));
    return {
      raw: bucket,
      id: String(firstDefined(bucket.bucket_id, bucket.id, '')),
      startTime: firstDefined(bucket.start_time, bucket.start, bucket.bucket_start, ''),
      endTime: firstDefined(bucket.end_time, bucket.end, bucket.bucket_end, ''),
      durationMinutes,
      sources: normalizedSources,
      consumers: normalizedConsumers,
      boundary: { gridExportKwh: asNumber(firstDefined(boundary.grid_export_kwh, boundary.export_kwh)) },
      balanceDeltaKwh: asNumber(bucket.advisory_lane_balance_delta_kwh),
      state: String(firstDefined(bucket.planning_state, bucket.state, '') || '').toLowerCase(),
      reason: firstDefined(bucket.reason_label, bucket.reason_code, bucket.reason, ''),
      confidence: firstDefined(bucket.confidence, ''),
      forecastQuality: firstDefined(bucket.forecast_quality, ''),
      disclosure: firstDefined(bucket.estimation_disclosure, ''),
      canonicalLanes: hasCanonicalLanes
      ,contractSupported: true
      ,contractFamily: isR1794 ? 'R1.79.4' : 'R1.79.3'
    };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { adaptPlanningBucket, signedPlanningGrid, planningEnergyFromPower };

// ---- src/domain/planning/planning-contract.js ----
// Authoritative Planning contract reader. No cross-domain fallback and no business recalculation.
  function planningObject(value) {
    const parsed = parseMaybeJson(value, value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  }
  function planningRows(value) {
    const parsed = parseMaybeJson(value, value);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') return Object.values(parsed);
    return [];
  }
  function planningById(value) {
    const parsed = parseMaybeJson(value, value);
    if (Array.isArray(parsed)) {
      return Object.fromEntries(parsed.map((row, index) => [
        String(row?.horizon_id || row?.id || (index === 0 ? 'D0' : 'D1')).toUpperCase(),
        planningObject(row)
      ]));
    }
    return planningObject(parsed);
  }
  function readPlanningContract(gateway, horizonId = 'D0') {
    const normalized = String(horizonId || 'D0').toUpperCase();
    const v2 = readEnergyPublicV2(gateway);
    const planning = planningObject(v2.planning);
    const horizonsById = planningById(planning.horizons);
    const horizon = planningObject(horizonsById[normalized] || horizonsById[normalized.toLowerCase()]);
    const summary = horizon;
    const canonicalLaneTotals = planningObject(planningObject(horizon.summary).lane_totals || horizon.lane_totals);
    const laneTotals = planningObject({
      ...canonicalLaneTotals,
      required_kwh:horizon.required_kwh,
      planned_kwh:horizon.planned_kwh,
      executed_kwh:horizon.executed_kwh,
      still_to_plan_kwh:horizon.still_to_plan_kwh,
      flexible_required_kwh:horizon.flexible_required_kwh,
      flexible_planned_kwh:horizon.flexible_planned_kwh,
      flexible_executed_kwh:horizon.flexible_executed_kwh,
      flexible_still_to_plan_kwh:horizon.flexible_still_to_plan_kwh
    });
    const buckets = planningRows(firstDefined(horizon.buckets, horizon.timeline, horizon.rows))
      .map((row,index)=>({ bucket_id:row?.bucket_id || row?.id || `bucket_${index+1}`, ...planningObject(row) }));
    const planningAssets = planningRows(planning.assets)
      .filter(row => String(row.asset_id || row.target_asset_id || ''));
    const planningAssetsById = Object.fromEntries(planningAssets.map(row => [String(row.asset_id || row.target_asset_id), planningObject(row)]));
    const d0 = planningObject(horizonsById.D0);
    const d1 = planningObject(horizonsById.D1);
    const d0Totals = planningObject(d0);
    const d1Totals = planningObject(d1);
    return Object.freeze({
      entityId:v2.envelope.entityId,
      contractVersion:v2.contractVersion,
      available:v2.available,
      attrs:planning,
      planningAssets,
      planningAssetsById,
      planningTodayTotals:d0Totals,
      planningTomorrowTotals:d1Totals,
      planningCombinedTotals:{},
      horizonsById,
      horizonId:normalized,
      horizon,
      summary,
      laneTotals,
      buckets,
      currentPlanningBucket:{},
      currentActionIntent:{},
      totalsSource:'RHI_ENERGY_PUBLIC_CONTRACT_V2.planning.horizons'
    });
  }

  function normalizePlanningLaneTotals(rawTotals = {}) {
    const totals = planningObject(rawTotals);
    const sources = planningObject(totals.sources);
    const consumers = planningObject(totals.consumers);
    const boundary = planningObject(totals.boundary);
    const flexibleRaw = firstDefined(
      consumers.flexible_assets,
      totals.flexible_assets,
      totals.flexible_loads_by_asset,
      totals.flexible_load_totals_by_asset,
      totals.consumer_totals_by_asset,
      totals.assets_by_id,
      {}
    );
    const parsedFlexible = parseMaybeJson(flexibleRaw, flexibleRaw);
    const flexibleAssetsById = Array.isArray(parsedFlexible)
      ? Object.fromEntries(parsedFlexible.map(row => [String(row?.asset_id || row?.id || ''), planningObject(row)]).filter(([id]) => id))
      : planningObject(parsedFlexible);
    const value = (...keys) => {
      for (const key of keys) {
        for (const scope of [totals, sources, consumers, boundary]) {
          const number = asNumber(scope[key]);
          if (number !== null) return number;
        }
      }
      return null;
    };
    return Object.freeze({
      raw: totals,
      sources,
      consumers,
      boundary,
      flexibleAssetsById,
      solarKwh: value('solar_kwh','solar_production_kwh','solar_total_kwh'),
      homeBatteryOutKwh: value('home_battery_supply_kwh','home_battery_discharge_kwh','battery_discharge_kwh','battery_out_kwh'),
      gridInKwh: value('grid_in_kwh','grid_import_kwh'),
      homeKwh: value('home_kwh','home_consumption_kwh','fixed_demand_kwh'),
      flexibleLoadsKwh: value('managed_energy_kwh','flexible_loads_kwh','planned_flexible_kwh','flexible_planned_kwh'),
      homeBatteryInKwh: value('home_battery_charge_kwh','battery_charge_kwh','battery_in_kwh'),
      gridOutKwh: value('grid_out_kwh','grid_export_kwh'),
      sourceTotalKwh: value('source_total_kwh','sources_total_kwh'),
      useTotalKwh: value('use_total_kwh','demand_total_kwh','consumer_total_kwh'),
      balanceDeltaKwh: value('balance_delta_kwh','lane_balance_delta_kwh'),
      homeBatteryNeedKwh: value('home_battery_need_kwh','battery_reserve_need_kwh')
    });
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { readPlanningContract, normalizePlanningLaneTotals };

// ---- src/domain/planning/planning-view-model.js ----
// Stable UX model builder for Planning. Renderers receive meaning, never backend paths.
  function createPlanningViewModel({ gateway, horizonId, flexibleAssets = [], storage = null }) {
    const contract = readPlanningContract(gateway, horizonId);
    const laneTotals = normalizePlanningLaneTotals(contract.laneTotals);
    const rows = contract.buckets.map(bucket => adaptPlanningBucket(bucket, contract.contractVersion));
    const quality = planningObject(contract.horizon.quality);
    const contractSupported = contract.available === true && String(contract.contractVersion || '').startsWith('2.');
    const stateText = String(firstDefined(contract.horizon.state, contract.horizon.status, quality.health, contract.horizon.quality, '')).toLowerCase();
    return Object.freeze({
      horizonId: contract.horizonId,
      horizon: contract.horizon,
      buckets: contract.buckets,
      assets: flexibleAssets,
      planningAssets: contract.planningAssets,
      planningAssetsById: contract.planningAssetsById,
      todayTotals: contract.planningTodayTotals,
      tomorrowTotals: contract.planningTomorrowTotals,
      combinedTotals: contract.planningCombinedTotals,
      storage,
      rows,
      summary: contract.summary,
      laneTotals,
      quality,
      currentActionIntent: contract.currentActionIntent,
      contractVersion: contract.contractVersion,
      contractSupported,
      currentBucketId: String(contract.currentPlanningBucket.bucket_id || ''),
      totalsSource: contract.totalsSource,
      complete: contractSupported && !/incomplete|partial|unavailable/.test(stateText)
    });
  }

  // ---- src/vendor/rhi-ux-core.js ----
/* RHI UX Core 1.6.3 */
// RHI UX Core 1.6.3 — build-time presentation primitives only.
// No domain semantics or Home Assistant contract/entity knowledge belongs here.
const RHI_UX_CORE_VERSION = "1.6.3";
const RHI_UX_COMPANY_LOGO_SVG = "<svg viewBox=\"75 116 1624 688\" role=\"img\" aria-labelledby=\"title desc\">\n<title id=\"title\">Robotix.be</title>\n<desc id=\"desc\">DomotiX · Network · Security</desc>\n<path fill=\"#0B4C86\" fill-rule=\"evenodd\" d=\"M536,549 L516,554 L512,556 L501,558 L497,560 L497,609 L512,608 L513,607 L525,606 L537,603 L537,551ZM1698,698 L1696,696 L1692,695 L1678,695 L1677,694 L1658,694 L1657,693 L1638,693 L1637,692 L1618,692 L1617,691 L1573,690 L1572,689 L1552,689 L1551,688 L1524,688 L1523,687 L1494,687 L1493,686 L1447,685 L1446,684 L1441,684 L1440,683 L1441,682 L1440,679 L1440,636 L1419,633 L1418,632 L1397,630 L1396,629 L1381,628 L1380,627 L1364,625 L1362,623 L1362,542 L1360,539 L1334,531 L1327,530 L1313,525 L1310,525 L1293,519 L1262,511 L1255,508 L1245,506 L1211,495 L1201,493 L1175,484 L1172,484 L1148,476 L1145,476 L1122,468 L1115,467 L1092,459 L1085,458 L1076,454 L1059,450 L1049,446 L1036,443 L1033,441 L1030,441 L1013,435 L1006,434 L997,430 L987,428 L964,420 L957,419 L944,414 L941,414 L928,409 L925,409 L909,403 L906,403 L890,397 L887,397 L867,404 L857,406 L848,410 L832,414 L819,419 L809,421 L784,430 L781,430 L771,434 L761,436 L752,440 L749,440 L721,450 L714,451 L683,462 L680,462 L639,476 L623,480 L620,482 L614,483 L601,488 L598,488 L595,490 L583,493 L573,497 L563,496 L562,495 L554,495 L547,499 L538,508 L343,571 L342,572 L342,638 L338,640 L332,640 L321,643 L315,643 L314,644 L309,644 L301,646 L300,648 L300,683 L296,685 L252,686 L251,687 L231,687 L230,688 L210,688 L209,689 L191,689 L190,690 L170,690 L169,691 L152,691 L151,692 L135,692 L134,693 L82,695 L81,696 L77,696 L76,700 L78,701 L121,701 L122,702 L299,704 L300,705 L300,729 L302,732 L306,733 L315,733 L316,734 L334,735 L335,736 L360,738 L361,739 L371,739 L372,740 L380,740 L381,741 L400,742 L401,743 L408,743 L409,744 L417,744 L418,745 L427,745 L428,746 L436,746 L437,747 L453,748 L454,749 L472,750 L473,751 L489,752 L490,753 L514,755 L515,756 L522,756 L523,757 L558,760 L559,761 L591,764 L599,766 L607,766 L608,767 L625,768 L632,770 L657,772 L665,774 L691,776 L692,777 L698,777 L706,779 L713,779 L714,780 L721,780 L729,782 L752,784 L753,785 L765,786 L766,787 L781,788 L789,790 L812,792 L813,793 L819,793 L820,794 L826,794 L827,795 L833,795 L841,797 L848,797 L849,798 L855,798 L856,799 L862,799 L870,801 L884,802 L885,801 L906,799 L907,798 L913,798 L914,797 L920,797 L921,796 L927,796 L928,795 L934,795 L935,794 L941,794 L942,793 L948,793 L949,792 L955,792 L956,791 L962,791 L970,789 L985,788 L986,787 L992,787 L999,785 L1006,785 L1007,784 L1035,781 L1036,780 L1042,780 L1050,778 L1057,778 L1058,777 L1065,777 L1066,776 L1072,776 L1080,774 L1103,772 L1104,771 L1112,771 L1113,770 L1127,769 L1128,768 L1149,766 L1150,765 L1157,765 L1165,763 L1173,763 L1174,762 L1190,761 L1191,760 L1205,759 L1213,757 L1223,757 L1224,756 L1256,753 L1257,752 L1264,752 L1265,751 L1272,751 L1273,750 L1316,746 L1324,744 L1332,744 L1333,743 L1341,743 L1342,742 L1350,742 L1351,741 L1359,741 L1360,740 L1369,740 L1370,739 L1378,739 L1379,738 L1387,738 L1388,737 L1398,737 L1399,736 L1416,735 L1417,734 L1424,734 L1425,733 L1434,733 L1440,731 L1440,708 L1441,707 L1440,706 L1442,704 L1513,704 L1514,703 L1524,703 L1527,704 L1528,703 L1657,702 L1658,701 L1695,701ZM1408,720 L1404,722 L1400,721 L1400,652 L1399,651 L1384,649 L1383,648 L1377,648 L1376,647 L1369,647 L1368,646 L1349,644 L1349,726 L1348,727 L1341,727 L1340,728 L1333,728 L1332,729 L1314,730 L1313,729 L1313,640 L1307,638 L1278,635 L1277,634 L1271,634 L1263,632 L1224,628 L1224,738 L1222,740 L1189,743 L1188,744 L1180,744 L1179,745 L1171,745 L1170,746 L1163,746 L1162,747 L1139,749 L1138,750 L1131,750 L1130,751 L1122,751 L1121,752 L1114,752 L1113,753 L1096,754 L1095,753 L1095,611 L1071,608 L1070,607 L1048,605 L1047,604 L1040,604 L1039,603 L1033,603 L1032,602 L1026,602 L1025,601 L1019,601 L1011,599 L1003,599 L995,597 L972,595 L971,594 L959,593 L958,592 L954,592 L953,593 L953,772 L951,774 L937,775 L936,776 L908,779 L900,781 L893,781 L885,783 L877,783 L876,782 L862,781 L861,780 L855,780 L847,778 L840,778 L839,777 L817,775 L816,774 L807,774 L806,773 L800,773 L799,772 L793,772 L785,770 L778,770 L777,769 L770,769 L769,768 L762,768 L761,767 L739,765 L738,764 L730,764 L729,763 L729,606 L714,607 L706,609 L676,612 L675,613 L661,614 L660,615 L646,616 L645,617 L631,618 L630,619 L623,619 L622,620 L622,750 L621,751 L588,748 L587,747 L571,746 L570,745 L562,745 L561,744 L552,744 L551,743 L544,743 L537,741 L537,631 L536,630 L507,633 L506,634 L500,634 L499,635 L485,636 L484,637 L476,638 L476,735 L475,736 L466,736 L465,735 L465,644 L464,643 L464,639 L402,648 L402,729 L401,730 L364,727 L361,725 L361,661 L364,659 L370,659 L371,658 L377,658 L378,657 L394,655 L395,654 L395,650 L394,649 L362,653 L361,654 L355,654 L354,655 L340,656 L339,657 L327,658 L326,659 L318,659 L317,660 L313,660 L312,659 L312,655 L322,652 L342,650 L355,647 L393,643 L406,640 L413,640 L414,639 L420,639 L421,638 L434,637 L435,636 L441,636 L449,634 L456,634 L457,633 L463,633 L471,631 L479,631 L480,630 L492,629 L493,628 L509,627 L510,626 L530,624 L536,622 L552,621 L553,620 L576,618 L583,616 L607,614 L608,613 L615,613 L616,612 L624,612 L632,610 L640,610 L648,608 L671,606 L672,605 L701,602 L702,601 L709,601 L710,600 L716,600 L717,599 L723,599 L731,597 L739,597 L747,595 L755,595 L762,593 L770,593 L771,592 L792,590 L800,588 L832,585 L833,584 L861,581 L862,580 L879,579 L880,578 L887,578 L888,577 L898,577 L906,579 L915,579 L916,580 L923,580 L924,581 L956,584 L963,586 L979,587 L986,589 L1002,590 L1003,591 L1031,594 L1039,596 L1046,596 L1054,598 L1062,598 L1063,599 L1069,599 L1076,601 L1083,601 L1084,602 L1090,602 L1098,604 L1106,604 L1107,605 L1113,605 L1114,606 L1120,606 L1121,607 L1127,607 L1135,609 L1143,609 L1144,610 L1166,612 L1167,613 L1181,614 L1189,616 L1197,616 L1198,617 L1210,618 L1211,619 L1218,619 L1219,620 L1233,621 L1234,622 L1242,622 L1243,623 L1272,626 L1273,627 L1279,627 L1287,629 L1312,631 L1313,632 L1319,632 L1320,633 L1339,635 L1340,636 L1347,636 L1354,638 L1362,638 L1363,639 L1369,639 L1376,641 L1404,644 L1408,646ZM885,440 L886,441 L886,560 L883,562 L875,562 L869,564 L861,564 L853,566 L846,566 L845,567 L817,570 L816,569 L816,460 L819,458 L822,458 L826,456 L829,456 L833,454 L836,454 L840,452 L843,452 L847,450 L858,448 L875,442ZM1339,551 L1339,612 L1338,613 L1338,620 L1337,621 L1332,620 L1330,617 L1330,589 L1331,588 L1331,578 L1330,577 L1331,559 L1330,558 L1330,554 L1316,549 L1283,541 L1276,538 L1269,537 L1251,531 L1248,531 L1248,606 L1246,608 L1238,608 L1237,607 L1230,607 L1222,605 L1215,605 L1214,604 L1208,604 L1207,603 L1201,603 L1200,602 L1194,602 L1193,601 L1187,601 L1186,600 L1180,600 L1172,598 L1149,596 L1142,594 L1135,594 L1128,592 L1086,587 L1085,586 L1066,584 L1065,583 L1058,583 L1057,582 L1035,580 L1034,579 L1021,578 L1020,577 L1014,577 L1013,576 L1007,576 L999,574 L992,574 L991,573 L985,573 L977,571 L963,570 L959,568 L959,524 L958,523 L958,509 L959,508 L959,455 L958,454 L958,448 L955,448 L941,443 L920,438 L891,429 L885,429 L860,437 L843,441 L823,448 L820,448 L813,451 L799,454 L786,459 L779,460 L766,465 L749,469 L743,472 L743,579 L741,581 L709,585 L708,586 L702,586 L701,587 L695,587 L694,588 L688,588 L687,589 L666,591 L665,592 L657,592 L656,593 L650,593 L649,594 L643,594 L635,596 L620,597 L612,599 L604,599 L603,598 L603,583 L602,582 L602,578 L603,577 L603,546 L602,545 L603,543 L603,523 L602,522 L602,513 L600,513 L556,527 L553,527 L543,531 L526,535 L488,548 L485,548 L482,550 L482,564 L480,566 L444,575 L440,577 L429,579 L425,581 L421,581 L414,584 L411,584 L395,589 L395,625 L396,626 L404,624 L416,623 L417,622 L423,622 L424,621 L451,618 L458,616 L464,616 L470,614 L478,614 L479,613 L489,612 L490,611 L490,556 L493,554 L522,547 L543,540 L545,547 L545,599 L544,600 L545,607 L543,609 L525,611 L518,613 L504,614 L503,615 L497,615 L496,616 L477,618 L476,619 L464,620 L463,621 L456,621 L455,622 L429,625 L428,626 L422,626 L421,627 L389,631 L388,632 L376,633 L375,634 L369,634 L362,636 L358,635 L358,583 L360,581 L372,578 L391,571 L394,571 L429,559 L432,559 L435,557 L444,555 L466,547 L469,547 L491,539 L494,539 L506,534 L509,534 L542,523 L545,523 L551,520 L564,517 L577,512 L580,512 L587,509 L590,509 L597,506 L610,503 L616,500 L636,495 L665,485 L679,482 L689,478 L692,478 L728,466 L735,465 L778,451 L785,450 L798,445 L818,440 L828,436 L848,431 L861,426 L870,424 L873,422 L884,420 L887,418 L913,426 L916,426 L926,430 L933,431 L936,433 L957,438 L999,451 L1006,452 L1023,458 L1030,459 L1033,461 L1065,469 L1085,476 L1092,477 L1099,480 L1120,485 L1130,489 L1141,491 L1147,494 L1182,503 L1212,513 L1231,517 L1265,528 L1268,528 L1272,530 L1303,538 L1309,541 L1316,542 L1326,546 L1336,548ZM1248,241 L1248,281 L1249,282 L1295,282 L1296,281 L1296,241 L1295,240 L1249,240ZM1493,178 L1490,184 L1487,195 L1487,246 L1488,247 L1489,255 L1493,263 L1498,270 L1503,274 L1515,280 L1523,282 L1533,282 L1534,283 L1640,282 L1641,280 L1641,250 L1640,246 L1549,246 L1546,245 L1541,240 L1540,237 L1541,234 L1639,234 L1641,226 L1641,198 L1640,197 L1640,191 L1635,178 L1625,167 L1618,163 L1602,159 L1526,159 L1525,160 L1517,161 L1505,166ZM1540,201 L1548,193 L1581,193 L1584,194 L1589,199 L1590,206 L1589,207 L1582,207 L1581,208 L1545,208 L1540,206ZM998,159 L995,161 L995,281 L996,282 L1049,282 L1049,160 L1048,159ZM1059,159 L1059,162 L1114,221 L1105,232 L1062,276 L1059,280 L1059,282 L1126,282 L1150,257 L1160,266 L1174,282 L1241,282 L1241,280 L1190,226 L1187,221 L1243,163 L1244,161 L1243,159 L1178,159 L1151,187 L1125,159 L1119,159 L1118,158 L1117,159ZM865,177 L852,165 L842,161 L834,160 L833,159 L819,159 L818,158 L815,159 L749,159 L748,160 L740,161 L728,166 L715,179 L712,185 L709,196 L709,245 L713,258 L718,266 L725,273 L737,279 L749,282 L831,282 L832,281 L841,280 L853,275 L866,262 L870,254 L872,246 L873,203 L872,202 L871,190ZM765,202 L770,198 L775,196 L805,196 L806,197 L810,197 L816,202 L819,211 L819,231 L816,239 L813,242 L804,245 L777,245 L768,242 L763,236 L763,230 L762,229 L762,211ZM514,177 L508,170 L499,164 L482,159 L456,159 L455,158 L446,158 L445,159 L392,159 L375,164 L365,171 L359,178 L353,193 L353,199 L352,200 L352,240 L353,241 L354,252 L358,261 L372,275 L385,280 L395,281 L396,282 L476,282 L477,281 L483,281 L491,279 L505,272 L513,264 L517,257 L520,248 L520,242 L521,241 L521,197 L520,196 L519,188ZM408,204 L414,198 L420,196 L450,196 L457,198 L463,204 L465,209 L465,232 L463,237 L457,243 L449,245 L422,245 L414,243 L409,239 L406,231 L406,210ZM894,134 L894,158 L893,159 L877,159 L876,160 L876,196 L893,196 L894,197 L894,247 L895,248 L896,257 L901,268 L911,277 L924,282 L929,282 L930,283 L965,283 L966,282 L980,281 L982,279 L982,245 L981,244 L959,245 L954,243 L951,240 L949,234 L949,197 L950,196 L979,196 L979,160 L978,159 L950,159 L949,158 L949,122 L948,121 L924,127 L920,127 L912,130 L899,132ZM134,122 L134,281 L135,282 L191,282 L192,281 L192,230 L193,229 L223,229 L272,282 L345,282 L343,277 L338,273 L295,227 L312,223 L323,217 L333,206 L336,199 L338,191 L338,155 L336,147 L332,139 L324,130 L315,125 L306,122 L289,121 L288,120 L137,120ZM192,163 L193,162 L266,162 L271,164 L275,168 L277,173 L277,178 L275,183 L271,187 L266,189 L193,189 L192,188ZM1311,117 L1310,118 L1310,260 L1311,261 L1310,263 L1310,280 L1311,282 L1358,282 L1362,272 L1372,279 L1383,282 L1435,282 L1448,279 L1458,274 L1467,265 L1471,258 L1474,247 L1474,240 L1475,239 L1474,193 L1471,183 L1465,173 L1458,167 L1451,163 L1435,159 L1390,159 L1375,163 L1366,169 L1365,168 L1365,118 L1364,117ZM1366,200 L1373,196 L1407,196 L1413,198 L1418,203 L1420,209 L1420,232 L1419,233 L1419,237 L1415,242 L1407,245 L1373,245 L1368,243 L1365,239 L1365,202ZM995,118 L995,151 L1049,151 L1049,117 L996,117ZM533,118 L533,281 L534,282 L582,282 L583,276 L585,272 L591,277 L597,280 L605,281 L606,282 L658,282 L674,278 L684,272 L690,266 L697,251 L698,239 L699,238 L699,229 L698,228 L698,193 L697,192 L697,188 L692,177 L684,168 L673,162 L661,159 L613,159 L600,162 L589,169 L588,168 L588,118 L587,117 L534,117ZM593,197 L596,196 L630,196 L638,199 L643,206 L643,234 L641,239 L638,242 L629,245 L598,245 L591,243 L588,239 L588,203Z\"/>\n<path fill=\"#5B95C8\" fill-rule=\"evenodd\" d=\"M1143,328 L1137,334 L1136,337 L1137,342 L1140,346 L1144,348 L1150,348 L1156,343 L1157,340 L1156,333 L1150,328ZM594,328 L588,334 L588,341 L593,347 L601,348 L607,344 L609,338 L608,334 L602,328ZM1591,313 L1590,314 L1609,341 L1609,360 L1617,360 L1618,359 L1618,341 L1635,317 L1636,313 L1635,312 L1628,312 L1614,331 L1612,330 L1605,319 L1599,312 L1598,313ZM1539,312 L1537,314 L1538,321 L1551,321 L1552,322 L1552,358 L1553,360 L1561,360 L1562,359 L1562,322 L1563,321 L1576,321 L1577,320 L1577,313 L1576,312ZM1519,312 L1512,313 L1512,360 L1520,360 L1521,358 L1521,314ZM1453,312 L1452,313 L1452,360 L1460,360 L1461,359 L1461,343 L1462,342 L1469,342 L1483,360 L1492,360 L1493,359 L1481,343 L1482,341 L1487,339 L1490,336 L1492,331 L1492,324 L1489,318 L1484,314 L1477,312ZM1461,322 L1462,321 L1478,321 L1482,324 L1483,329 L1478,334 L1462,334 L1461,333ZM1391,313 L1391,347 L1394,354 L1398,358 L1405,361 L1418,361 L1424,359 L1428,356 L1432,348 L1432,313 L1431,312 L1425,312 L1423,314 L1423,346 L1419,351 L1414,353 L1408,353 L1402,349 L1400,344 L1400,313 L1399,312ZM1273,313 L1273,359 L1274,360 L1308,360 L1308,352 L1283,352 L1282,351 L1282,341 L1283,340 L1305,340 L1306,339 L1306,332 L1283,332 L1282,331 L1282,322 L1283,321 L1306,321 L1308,319 L1308,314 L1306,312 L1275,312ZM1040,313 L1040,359 L1041,360 L1048,360 L1049,359 L1049,345 L1054,341 L1071,360 L1082,360 L1081,357 L1061,335 L1081,313 L1079,312 L1071,312 L1051,331 L1049,330 L1049,313 L1048,312ZM982,312 L981,313 L981,325 L980,326 L980,345 L981,346 L981,356 L980,358 L981,360 L989,360 L990,343 L991,342 L992,343 L993,342 L998,343 L1012,360 L1021,360 L1020,356 L1010,343 L1011,341 L1017,338 L1020,333 L1021,326 L1019,320 L1013,314 L1006,312ZM989,325 L991,321 L1007,321 L1011,324 L1012,328 L1006,334 L991,334 L990,333ZM832,313 L834,322 L838,332 L838,335 L847,360 L854,360 L856,358 L865,330 L867,332 L876,359 L877,360 L884,360 L885,359 L899,315 L898,312 L891,312 L890,313 L885,327 L883,337 L880,343 L870,313 L863,312 L861,314 L854,337 L851,342 L848,336 L841,313 L839,312ZM781,312 L780,313 L780,320 L781,321 L794,321 L795,322 L795,358 L796,360 L804,360 L804,329 L805,328 L805,322 L806,321 L818,321 L820,319 L820,314 L818,312ZM731,312 L729,314 L729,355 L730,356 L730,360 L765,360 L765,353 L764,352 L740,352 L739,351 L739,341 L740,340 L762,340 L763,339 L763,333 L762,332 L740,332 L739,331 L739,322 L740,321 L763,321 L765,319 L764,313 L763,312ZM664,313 L664,359 L665,360 L672,360 L673,359 L673,330 L674,329 L698,360 L707,360 L707,313 L706,312 L698,313 L698,342 L697,343 L673,312 L666,312ZM493,312 L492,314 L508,336 L491,359 L492,360 L501,360 L510,348 L515,344 L527,360 L536,360 L537,358 L521,337 L521,334 L536,315 L536,313 L535,312 L527,312 L514,328 L501,312ZM466,312 L465,313 L465,359 L466,360 L474,360 L474,312ZM410,312 L409,313 L409,319 L413,321 L423,321 L424,322 L424,359 L425,360 L432,360 L433,359 L433,322 L435,320 L436,321 L448,320 L449,319 L449,314 L448,312ZM274,313 L274,323 L273,324 L273,358 L275,360 L282,360 L283,359 L283,336 L284,335 L288,341 L296,358 L302,358 L307,350 L311,340 L313,338 L313,336 L315,334 L316,335 L316,359 L317,360 L324,360 L325,359 L325,313 L324,312 L315,312 L303,338 L299,343 L283,312 L275,312ZM139,312 L138,313 L138,359 L139,360 L161,360 L162,359 L166,359 L172,356 L179,349 L182,343 L182,330 L179,322 L172,315 L164,312ZM148,320 L163,321 L170,326 L173,333 L173,338 L171,344 L165,350 L162,351 L148,351 L147,350 L147,321ZM1344,312 L1339,314 L1330,322 L1326,332 L1327,345 L1330,351 L1338,358 L1346,361 L1357,361 L1368,356 L1371,353 L1371,351 L1366,346 L1361,350 L1354,353 L1349,353 L1343,351 L1338,346 L1336,342 L1336,331 L1338,327 L1343,322 L1348,320 L1358,321 L1365,326 L1368,325 L1371,320 L1366,315 L1359,312 L1354,312 L1353,311ZM1237,311 L1224,313 L1220,315 L1215,322 L1215,330 L1221,337 L1230,340 L1239,341 L1244,345 L1244,348 L1240,352 L1237,353 L1230,353 L1223,350 L1220,347 L1218,347 L1214,352 L1214,354 L1227,361 L1243,360 L1247,358 L1251,354 L1253,350 L1253,341 L1247,335 L1243,333 L1227,330 L1224,327 L1224,324 L1229,320 L1237,320 L1244,323 L1246,325 L1249,323 L1251,318 L1249,316ZM929,312 L922,315 L913,325 L911,331 L911,342 L915,351 L920,356 L927,360 L931,361 L946,360 L952,357 L959,350 L962,344 L962,329 L961,326 L954,317 L947,313 L939,311ZM930,321 L933,320 L944,321 L950,326 L953,333 L952,343 L943,352 L939,353 L930,352 L923,346 L920,339 L921,330 L924,325ZM355,315 L350,320 L345,330 L346,345 L352,354 L360,359 L367,361 L379,360 L387,356 L393,350 L397,340 L397,332 L394,323 L385,314 L377,311 L364,311ZM361,322 L365,320 L376,320 L381,322 L385,326 L387,330 L387,341 L385,345 L380,350 L375,352 L366,352 L358,347 L355,342 L354,333 L357,326ZM215,313 L205,322 L202,329 L201,338 L204,348 L211,356 L219,360 L230,361 L242,357 L249,351 L253,342 L253,336 L254,335 L253,334 L253,328 L250,322 L243,315 L234,311 L221,311ZM218,322 L222,320 L233,320 L237,322 L242,327 L244,332 L244,339 L241,346 L237,350 L232,352 L223,352 L217,349 L213,345 L211,340 L211,332 L213,327Z\"/>\n</svg>";

function rhiUxEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[ch]));
}

function rhiUxDisplay(value, fallback = "—") {
  return value === undefined || value === null || value === "" ? fallback : String(value);
}

function rhiUxLocaleCandidates(locale = "en") {
  const normalized = String(locale || "en").trim().replace(/_/g, "-").toLowerCase();
  const base = normalized.split("-")[0] || "en";
  return [...new Set([normalized, base, "en"])];
}

function rhiUxTranslate(resources = {}, key = "", { locale = "en", params = {}, fallback = "" } = {}) {
  const wanted = String(key || "");
  let template = "";
  for (const candidate of rhiUxLocaleCandidates(locale)) {
    const row = resources?.[candidate];
    if (row && Object.prototype.hasOwnProperty.call(row, wanted)) {
      template = String(row[wanted] ?? "");
      break;
    }
  }
  if (!template) template = fallback || wanted;
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, name) => rhiUxEscape(rhiUxDisplay(params?.[name], "")));
}

function rhiUxFormatNumber(value, { locale = "en", maximumFractionDigits = 2, minimumFractionDigits = 0 } = {}) {
  if (value === undefined || value === null || value === "" || !Number.isFinite(Number(value))) return "—";
  return new Intl.NumberFormat(locale, { maximumFractionDigits, minimumFractionDigits }).format(Number(value));
}

function rhiUxFormatCurrency(value, currency = "EUR", { locale = "en", maximumFractionDigits = 2 } = {}) {
  if (value === undefined || value === null || value === "" || !Number.isFinite(Number(value))) return "—";
  return new Intl.NumberFormat(locale, { style:"currency", currency, maximumFractionDigits }).format(Number(value));
}

function rhiUxFormatPercent(value, { locale = "en", scale = 100, maximumFractionDigits = 1 } = {}) {
  if (value === undefined || value === null || value === "" || !Number.isFinite(Number(value))) return "—";
  return new Intl.NumberFormat(locale, { style:"percent", maximumFractionDigits }).format(Number(value) / Number(scale || 100));
}

function rhiUxFormatDateTime(value, { locale = "en", dateStyle = "medium", timeStyle = "short" } = {}) {
  if (value === undefined || value === null || value === "") return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, { dateStyle, timeStyle }).format(date);
}

function rhiUxStatusItem({ icon = "•", label = "", value = "—", detail = "" } = {}) {
  const iconMarkup = /^mdi:/.test(String(icon || "")) ? `<ha-icon icon="${rhiUxEscape(icon)}"></ha-icon>` : rhiUxEscape(icon);
  return `<div class="rhiUxStatusItem"><span class="rhiUxStatusIcon">${iconMarkup}</span><div class="rhiUxStatusCopy"><small>${rhiUxEscape(label)}</small><b>${rhiUxEscape(rhiUxDisplay(value))}</b>${detail ? `<em>${rhiUxEscape(detail)}</em>` : ""}</div></div>`;
}

function rhiUxStatusGrid(items = []) {
  return `<section class="rhiUxStatusGrid">${items.map(rhiUxStatusItem).join("")}</section>`;
}

function rhiUxPageHero({ eyebrow = "", title = "", description = "", image = "", imageAlt = "" } = {}) {
  return `<section class="rhiUxPageHero"><div class="rhiUxPageHeroCopy">${eyebrow ? `<small>${rhiUxEscape(eyebrow)}</small>` : ""}<h2>${rhiUxEscape(title)}</h2>${description ? `<p>${rhiUxEscape(description)}</p>` : ""}</div>${image ? `<div class="rhiUxPageHeroArt"><img src="${rhiUxEscape(image)}" alt="${rhiUxEscape(imageAlt)}"></div>` : ""}</section>`;
}

function rhiUxState({ state = "unavailable", title = "Unavailable", detail = "" } = {}) {
  return `<div class="rhiUxState" data-state="${rhiUxEscape(state)}"><b>${rhiUxEscape(title)}</b>${detail ? `<span>${rhiUxEscape(detail)}</span>` : ""}</div>`;
}

function rhiUxConclusion({ title = "", detail = "", label = "Conclusion" } = {}) {
  return `<section class="rhiUxConclusion"><div><small>${rhiUxEscape(label)}</small><h2>${rhiUxEscape(title)}</h2>${detail ? `<p>${rhiUxEscape(detail)}</p>` : ""}</div></section>`;
}

function rhiUxTechnicalFooter({ product = "", uxVersion = "", backendVersion = "", issue = "", severity = "" } = {}) {
  return `<footer class="rhiUxTechnicalFooter"><span>${rhiUxEscape(product)} UX ${rhiUxEscape(uxVersion)}</span><span>Backend ${rhiUxEscape(rhiUxDisplay(backendVersion,"Unknown"))}</span>${issue ? `<span data-severity="${rhiUxEscape(severity)}">${rhiUxEscape(issue)}</span>` : ""}</footer>`;
}

function rhiUxCompanyBrand({ ariaLabel = "Robotix.be — DomotiX · Network · Security" } = {}) {
  return `<span class="rhiUxCompanyLogo" role="img" aria-label="${rhiUxEscape(ariaLabel)}">${RHI_UX_COMPANY_LOGO_SVG}</span>`;
}

function rhiUxDomainShell({ product = "Home Intelligence", domain = "", modules = [], activeModule = "", activeItem = "", brandHtml = rhiUxCompanyBrand() } = {}) {
  const selected = modules.find(row => String(row.id || "") === String(activeModule || "")) || modules[0] || { items:[] };
  const moduleButtons = modules.map(row => {
    const active = String(row.id || "") === String(selected.id || "");
    return `<button type="button" class="rhiUxModuleTab${active ? " active" : ""}" data-rhi-module="${rhiUxEscape(row.id || "")}"${row.target ? ` data-nav="${rhiUxEscape(row.target)}"` : ""}><span>${rhiUxEscape(row.label || row.id || "")}</span></button>`;
  }).join("");
  const itemButtons = (selected.items || []).map(row => {
    const active = String(row.id || "") === String(activeItem || "");
    return `<button type="button" class="rhiUxDomainTab${active ? " active" : ""}" data-rhi-item="${rhiUxEscape(row.id || "")}"${row.target ? ` data-nav="${rhiUxEscape(row.target)}"` : ""}><span>${rhiUxEscape(row.label || row.id || "")}</span></button>`;
  }).join("");
  return `<header class="rhiUxDomainShell"><div class="rhiUxProductArea"><div class="rhiUxDomainShellTop"><div class="rhiUxDomainIdentity"><span>${rhiUxEscape(product)}</span><strong>${rhiUxEscape(domain)}</strong></div><nav class="rhiUxModuleTabs" aria-label="Modules">${moduleButtons}</nav></div><div class="rhiUxDomainShellBottom"><nav class="rhiUxDomainTabs" aria-label="${rhiUxEscape(selected.label || domain || "Domain")} navigation">${itemButtons}</nav></div></div>${brandHtml ? `<div class="rhiUxCompanyBrand">${brandHtml}</div>` : ""}</header>`;
}


function rhiUxQuickActionBar({ label = "Quick actions", actions = [] } = {}) {
  const visibleActions = actions.filter(action => action?.visible !== false);
  if (!visibleActions.length) return "";
  return `<section class="rhiUxQuickActionBar" aria-label="${rhiUxEscape(label)}"><small>${rhiUxEscape(label)}</small><div class="rhiUxQuickActions">${visibleActions.map((action,index) => {
    const disabled = action.enabled === false || action.disabled === true;
    const reason = String(action.reason || "");
    return `<button type="button" class="rhiUxQuickAction${action.primary || index === 0 ? " primary" : ""}"${action.target ? ` data-nav="${rhiUxEscape(action.target)}"` : ""}${disabled ? " disabled" : ""}${reason ? ` title="${rhiUxEscape(reason)}"` : ""}>${action.icon ? `<ha-icon icon="${rhiUxEscape(action.icon)}"></ha-icon>` : ""}<span>${rhiUxEscape(action.label || "Open")}</span></button>`;
  }).join("")}</div></section>`;
}

function rhiUxContextBar({ label = "View", controls = [], controlsId = "" } = {}) {
  if (!Array.isArray(controls) || controls.length === 0) return "";
  const labelled = label ? `<small>${rhiUxEscape(label)}</small>` : "";
  const body = controls.filter(control => control?.visible !== false).map((control,index) => {
    const attrs = [];
    if (control.value !== undefined) attrs.push(`data-value="${rhiUxEscape(control.value)}"`);
    if (control.target) attrs.push(`data-nav="${rhiUxEscape(control.target)}"`);
    if (control.pressed !== undefined) attrs.push(`aria-pressed="${control.pressed ? "true" : "false"}"`);
    if (control.enabled === false || control.disabled) attrs.push("disabled");
    if (control.reason) attrs.push(`title="${rhiUxEscape(control.reason)}"`);
    const cls = `rhiUxContextControl${control.active || control.pressed ? " active" : ""}`;
    return `<button type="button" class="${cls}" ${attrs.join(" ")}>${rhiUxEscape(control.label || control.value || `Option ${index+1}`)}</button>`;
  }).join("");
  const idAttr = controlsId ? ` aria-controls="${rhiUxEscape(controlsId)}"` : "";
  return `<section class="rhiUxContextBar" aria-label="${rhiUxEscape(label || "View controls")}"${idAttr}>${labelled}<div class="rhiUxContextControls">${body}</div></section>`;
}


function rhiUxPageTemplate({ hero = "", status = "", actions = "", context = "", content = "", className = "" } = {}) {
  return `<main class="rhiUxPage rhiUxPageStack ${rhiUxEscape(className)}">${hero}${status}${actions}${context}<section class="rhiUxPageContent">${content}</section></main>`;
}

function rhiUxAssetCardShell({ identity = "", facts = "", relationships = "", actions = "", details = "", feedback = "", className = "" } = {}) {
  const cls = ["rhiUxAssetCardShell", String(className || "").trim()].filter(Boolean).join(" ");
  const body = [
    identity ? `<div class="rhiUxAssetCardIdentity">${identity}</div>` : "",
    facts ? `<div class="rhiUxAssetCardFacts">${facts}</div>` : "",
    relationships ? `<div class="rhiUxAssetCardRelationships">${relationships}</div>` : "",
    actions ? `<div class="rhiUxAssetCardActions">${actions}</div>` : "",
    details ? `<div class="rhiUxAssetCardDetails">${details}</div>` : "",
    feedback ? `<div class="rhiUxAssetCardFeedback">${feedback}</div>` : ""
  ].join("");
  return `<article class="${rhiUxEscape(cls)}">${body}</article>`;
}

function rhiUxAssetIdentity({ eyebrow = "", title = "", subtitle = "", visual = "" } = {}) {
  return `<header class="rhiUxAssetIdentity">${visual ? `<div class="rhiUxAssetVisual">${visual}</div>` : ""}<div class="rhiUxAssetIdentityCopy">${eyebrow ? `<small>${rhiUxEscape(eyebrow)}</small>` : ""}<h2>${rhiUxEscape(title)}</h2>${subtitle ? `<p>${rhiUxEscape(subtitle)}</p>` : ""}</div></header>`;
}

function rhiUxAssetFactGrid(items = []) {
  return `<div class="rhiUxAssetFactGrid">${items.map(item => `<div class="rhiUxAssetFact"><small>${rhiUxEscape(item?.label || "")}</small><b>${rhiUxEscape(rhiUxDisplay(item?.value))}</b>${item?.detail ? `<span>${rhiUxEscape(item.detail)}</span>` : ""}</div>`).join("")}</div>`;
}

function rhiUxAssetRelationship({ label = "", value = "", detail = "", target = "" } = {}) {
  return `<div class="rhiUxAssetRelationship"><div><small>${rhiUxEscape(label)}</small><b>${rhiUxEscape(rhiUxDisplay(value))}</b>${detail ? `<span>${rhiUxEscape(detail)}</span>` : ""}</div>${target ? `<button type="button" data-nav="${rhiUxEscape(target)}">Open</button>` : ""}</div>`;
}

function rhiUxAssetDisclosure({ title = "Details", content = "", open = false } = {}) {
  return `<details class="rhiUxAssetDisclosure"${open ? " open" : ""}><summary>${rhiUxEscape(title)}</summary><div>${content}</div></details>`;
}

function rhiUxWriteFeedback({ state = "idle", message = "" } = {}) {
  if (!message) return "";
  return `<div class="rhiUxWriteFeedback" data-state="${rhiUxEscape(state)}" role="status">${rhiUxEscape(message)}</div>`;
}




const RHI_UX_NAVIGATION_STORAGE_KEY = "rhi.navigation.registry.v1";

function rhiUxReadNavigationRegistry(storage = globalThis?.localStorage) {
  try {
    const raw = storage?.getItem?.(RHI_UX_NAVIGATION_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (_) {
    return {};
  }
}

function rhiUxRegisterDomainNavigation({ domain = "", assetDetailTemplate = "" } = {}, storage = globalThis?.localStorage) {
  const key = String(domain || "").trim();
  const template = String(assetDetailTemplate || "").trim();
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(key)) return false;
  if (!template || !template.includes("{asset_id}")) return false;
  if (/^https?:\/\//i.test(template)) return false;
  try {
    const registry = rhiUxReadNavigationRegistry(storage);
    registry[key] = { asset_detail_template:template };
    storage?.setItem?.(RHI_UX_NAVIGATION_STORAGE_KEY, JSON.stringify(registry));
    return true;
  } catch (_) {
    return false;
  }
}

function rhiUxResolveDomainAssetNavigation(domain = "", assetId = "", storage = globalThis?.localStorage) {
  const key = String(domain || "").trim();
  const id = String(assetId || "").trim();
  if (!key || !id) return "";
  const row = rhiUxReadNavigationRegistry(storage)[key];
  const template = String(row?.asset_detail_template || "");
  if (!template.includes("{asset_id}")) return "";
  return template.replaceAll("{asset_id}", encodeURIComponent(id));
}


function rhiUxVisualPickerStyles() {
  return `
.rhiUxVisualPickerBackdrop{position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.44);display:grid;place-items:center;padding:20px}
.rhiUxVisualPickerPanel{width:min(920px,94vw);max-height:min(82vh,760px);overflow:hidden;background:#fff;border:1px solid var(--rhi-color-line,#e5ebf3);border-radius:20px;box-shadow:0 30px 80px rgba(15,23,42,.24);padding:16px;box-sizing:border-box;display:grid;grid-template-rows:auto auto minmax(0,1fr) auto auto;gap:10px}
.rhiUxVisualPickerHead{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;min-height:0}
.rhiUxVisualPickerHead small{font-size:var(--rhi-font-label);font-weight:800;letter-spacing:.12em;color:#64748b}.rhiUxVisualPickerHead h3{margin:2px 0 0;font-size:20px}.rhiUxVisualPickerHead p{margin:3px 0 0;font-size:11px;color:#64748b}
.rhiUxVisualPickerFilters{display:flex;gap:6px;flex-wrap:wrap;margin:0;min-height:0}
.rhiUxVisualPickerFilters button{border:1px solid #dbe3ee;background:#fff;border-radius:999px;padding:5px 10px;font-size:11px;font-weight:700;cursor:pointer}.rhiUxVisualPickerFilters button.selected{border-color:#93c5fd;background:#eff6ff;color:#1d4ed8}
.rhiUxVisualChoiceGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-auto-rows:142px;gap:8px;margin:0;overflow-y:auto;overscroll-behavior:contain;padding:2px 3px 4px 1px;align-content:start}
.rhiUxVisualChoice{height:142px;min-height:142px;max-height:142px;display:grid;grid-template-rows:86px minmax(0,1fr);gap:6px;align-items:stretch;text-align:left;border:1px solid #e2e8f0;background:#fff;border-radius:12px;padding:8px;cursor:pointer;overflow:hidden}.rhiUxVisualChoice:hover{border-color:#93c5fd;background:#f8fbff}.rhiUxVisualChoice.selected{border-color:#2563eb;box-shadow:0 0 0 2px rgba(37,99,235,.12);background:#f8fbff}
.rhiUxVisualChoiceImage{width:100%;height:86px;min-width:0;min-height:86px;max-width:none;max-height:86px;display:grid;place-items:center;overflow:hidden}.rhiUxVisualChoiceImage img{display:block;width:100%;height:100%;min-width:0;min-height:0;max-width:100%;max-height:100%;object-fit:contain;object-position:center}
.rhiUxVisualChoiceCopy{min-width:0;align-self:end}.rhiUxVisualChoiceCopy small,.rhiUxVisualChoiceCopy b,.rhiUxVisualChoiceCopy em{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rhiUxVisualChoiceCopy small{font-size:var(--rhi-font-label);color:#64748b;text-transform:uppercase}.rhiUxVisualChoiceCopy b{font-size:12px;margin-top:1px}.rhiUxVisualChoiceCopy em{font-size:var(--rhi-font-small);color:#64748b;font-style:normal;margin-top:1px}
.rhiUxVisualPickerRefine{display:grid;grid-template-columns:repeat(4,minmax(120px,1fr));gap:8px;margin:0}.rhiUxVisualPickerRefine label span{display:block;font-size:var(--rhi-font-label);color:#64748b;margin-bottom:3px}.rhiUxVisualPickerRefine select{width:100%;height:34px;border:1px solid #dbe3ee;border-radius:8px;background:#fff;padding:0 8px}
.rhiUxVisualPickerFooter{display:flex;align-items:center;gap:8px;margin:0;padding-top:9px;border-top:1px solid #edf1f6}.rhiUxVisualPickerSpacer{flex:1}.rhiUxVisualPickerFooter button{height:34px;border:1px solid #dbe3ee;border-radius:9px;background:#fff;padding:0 12px;font-size:var(--rhi-font-small);font-weight:700}.rhiUxVisualPickerFooter button.primary{background:#0b65ea;color:#fff;border-color:#0b65ea}.rhiUxVisualPickerFooter button:disabled{opacity:.45}
@media(max-width:900px){.rhiUxVisualChoiceGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:560px){.rhiUxVisualPickerBackdrop{padding:8px}.rhiUxVisualPickerPanel{width:96vw;max-height:88vh;padding:12px}.rhiUxVisualChoiceGrid{grid-template-columns:1fr;grid-auto-rows:116px}.rhiUxVisualChoice{height:116px;min-height:116px;max-height:116px;grid-template-columns:94px minmax(0,1fr);grid-template-rows:1fr}.rhiUxVisualChoiceImage{width:94px;height:86px;min-width:94px;max-width:94px}.rhiUxVisualChoiceCopy{align-self:center}.rhiUxVisualPickerRefine{grid-template-columns:1fr 1fr}.rhiUxVisualPickerFooter{flex-wrap:wrap}}
`;
}

function rhiUxVisualPickerShell({
  eyebrow = "Appearance",
  title = "Choose appearance",
  description = "",
  filtersHtml = "",
  choicesHtml = "",
  refineHtml = "",
  selectedHtml = "",
  resetHtml = "",
  cancelHtml = "",
  saveHtml = "",
  modal = false,
  closeHtml = ""
} = {}) {
  const panel = `<section class="rhiUxVisualPickerPanel" role="${modal ? "dialog" : "region"}"${modal ? ' aria-modal="true"' : ""}>
    <header class="rhiUxVisualPickerHead"><div><small>${rhiUxEscape(eyebrow)}</small><h3>${rhiUxEscape(title)}</h3>${description ? `<p>${rhiUxEscape(description)}</p>` : ""}</div>${closeHtml}</header>
    ${filtersHtml ? `<div class="rhiUxVisualPickerFilters">${filtersHtml}</div>` : ""}
    <div class="rhiUxVisualChoiceGrid">${choicesHtml}</div>
    ${refineHtml ? `<div class="rhiUxVisualPickerRefine">${refineHtml}</div>` : ""}
    <footer class="rhiUxVisualPickerFooter">${resetHtml}<span class="rhiUxVisualPickerSpacer"></span>${selectedHtml}${cancelHtml}${saveHtml}</footer>
  </section>`;
  return modal ? `<div class="rhiUxVisualPickerBackdrop">${panel}</div>` : panel;
}


function rhiUxVisualFilterButtons({ values = [], active = "all", allLabel = "All", attribute = "data-rhi-visual-filter" } = {}) {
  const rows = [{ value:"all", label:allLabel }, ...values.map(value => typeof value === "object" ? value : { value, label:value })];
  return rows.map(row => { const value=String(row?.value ?? ""); const label=String(row?.label ?? value); const selected=value===String(active ?? "all"); return `<button type="button" class="${selected ? "selected" : ""}" ${rhiUxEscape(attribute)}="${rhiUxEscape(value)}" aria-pressed="${selected ? "true" : "false"}">${rhiUxEscape(label)}</button>`; }).join("");
}
function rhiUxVisualChoice({ id = "", image = "", imageAlt = "", eyebrow = "", label = "", detail = "", selected = false, imageStyle = "", attributes = {} } = {}) {
  const attrs=Object.entries(attributes || {}).filter(([key])=>/^data-[a-z0-9_-]+$/i.test(String(key))).map(([key,value])=>`${rhiUxEscape(key)}="${rhiUxEscape(value)}"`).join(" "); const style=imageStyle ? ` style="${rhiUxEscape(imageStyle)}"` : "";
  return `<button type="button" class="rhiUxVisualChoice${selected ? " selected" : ""}" data-rhi-visual-choice="${rhiUxEscape(id)}" ${attrs} aria-pressed="${selected ? "true" : "false"}><span class="rhiUxVisualChoiceImage">${image ? `<img src="${rhiUxEscape(image)}" alt="${rhiUxEscape(imageAlt)}"${style}>` : ""}</span><span class="rhiUxVisualChoiceCopy">${eyebrow ? `<small>${rhiUxEscape(eyebrow)}</small>` : ""}<b>${rhiUxEscape(label)}</b>${detail ? `<em>${rhiUxEscape(detail)}</em>` : ""}</span></button>`;
}
function rhiUxVisualSelect({ label = "", value = "", options = [], placeholder = "", disabled = false, attribute = "data-rhi-visual-select" } = {}) {
  const current=String(value ?? ""); const first=placeholder ? `<option value="" ${current ? "" : "selected"} disabled>${rhiUxEscape(placeholder)}</option>` : ""; const rows=options.map(row=>typeof row==="object" ? row : {value:row,label:row}).map(row=>`<option value="${rhiUxEscape(row.value)}" ${String(row.value)===current ? "selected" : ""}>${rhiUxEscape(row.label ?? row.value)}</option>`).join(""); return `<label><span>${rhiUxEscape(label)}</span><select ${rhiUxEscape(attribute)}="1" ${disabled ? "disabled" : ""}>${first}${rows}</select></label>`;
}

// ---- src/app/localization.js ----
// Energy product localization.
// Machine identifiers and backend semantic codes remain untranslated.
const RHI_ENERGY_TRANSLATIONS = Object.freeze({
  en:Object.freeze({
    "nav.energy":"Energy","nav.overview":"Overview","nav.flow":"Flow","nav.solar":"Solar","nav.battery":"Home Battery","nav.consumption":"Consumption","nav.gas":"Gas",
    "nav.intelligence":"Intelligence","nav.plan":"Plan","nav.operational_plan":"Now","nav.tactical_plan":"Today & Tomorrow","nav.strategic_plan":"Long term","nav.settings":"Settings","nav.insights":"Insights","nav.performance":"Performance","nav.value":"Value","nav.retrospective":"Retrospective",
    "hero.overview.title":"Energy Overview","hero.overview.description":"See what your home is producing, using, storing and exchanging right now.",
    "hero.flow.title":"Energy Flow","hero.flow.description":"See where energy is coming from and where it is going right now.",
    "hero.solar.title":"Solar","hero.solar.description":"See current solar production and the equipment contributing to it.",
    "hero.battery.title":"Home Battery","hero.battery.description":"See stored energy, current battery activity and the reserve available to your home.",
    "hero.consumption.title":"Consumption","hero.consumption.description":"See where energy is being used and which flexible loads can be planned.",
    "hero.gas.title":"Gas","hero.gas.description":"See gas use over time and whether measurements are available.",
    "hero.plan.title":"Plan","hero.plan.description":"See what should happen now, today and tomorrow, and what still needs attention.",
    "hero.settings.title":"Settings","hero.settings.description":"Adjust how Home Intelligence should manage your energy within the available options.",
    "hero.performance.title":"Performance","hero.performance.description":"Review measured energy and how Home Intelligence performed.",
    "hero.value.title":"Value","hero.value.description":"See the financial result of your energy system for the selected period.",
    "hero.retrospective.title":"Retrospective","hero.retrospective.description":"See what worked, what needs attention and where evidence is still incomplete.",
    "common.quick_actions":"Quick actions","common.not_available":"Not available","common.not_measured":"Not measured","common.unknown":"Unknown",
    "common.details":"Details","common.diagnostics":"Diagnostics","common.configuration":"Configuration","common.children":"Children","common.save":"Save","common.cancel":"Cancel","common.reset":"Reset",
    "common.today":"Today","common.tomorrow":"Tomorrow","common.information_missing":"This information is not available yet.",
    "reason.intelligence_off":"Energy Intelligence is off","reason.automation_disabled":"Automation is disabled","reason.disabled":"Disabled","reason.not_available":"Not available","reason.not_published":"Information is not available yet.","reason.no_battery_policy":"Battery policy information is not available yet","reason.data_incomplete":"Some details are unavailable","reason.verification_required":"Verification is needed","reason.reset_pending":"Reset in progress","reason.confirmation_needed":"Confirmation needed","reason.waiting":"Waiting","reason.preparing":"Preparing","reason.not_configured":"Setup needed","common.appearance":"Appearance","common.choose_appearance":"Choose appearance","common.selected":"Selected","common.save_appearance":"Save appearance","common.automatic":"Automatic","common.off":"Off","common.advice":"Advice","common.forced":"Forced","common.high":"High","common.normal":"Normal","common.low":"Low","section.production_supply":"Production & supply","section.production_supply_desc":"Energy available to the home now.","section.consumption_desc":"Site demand and its active components.","section.flexible_loads":"Flexible loads","section.flexible_loads_desc":"Current execution, next action, requested power and operational reason. Hardware configuration is not shown here.","section.other_assets":"Other assets","section.supply":"Supply","section.supply_desc":"Expected usable energy for the selected horizon.","section.demand":"Demand","section.demand_desc":"Expected Home Consumption, Flexible Loads and storage charging.","section.grid_impact":"Grid impact","section.grid_impact_desc":"Expected grid exchange for the selected horizon.","flow.physical":"Physical Energy Flow","flow.physical_desc":"Live measured energy paths only. Disabled and planning-only assets are excluded.","flow.producers":"Producers","flow.consumers":"Consumers","flow.charging_connections":"Charging connections","flow.charging_connections_desc":"Chargers and vehicle assignments currently visible to Energy.","flow.physical_consumers":"Physical consumers","flow.physical_consumers_desc":"Participating loads and their current charging connection; idle assets remain visible.","gas.history":"Gas usage history","gas.meter":"Gas meter","gas.meter_desc":"Current meter state and measured values.","gas.connect":"Connect your gas meter","gas.connect_desc":"Connect a gas meter before consumption history can be shown.","battery.state":"Home Battery state","battery.state_desc":"Combined operational truth for the Home Battery system.","battery.contributors":"Home Battery contributors","battery.contributors_desc":"Physical batteries contributing to the aggregate.","settings.automation":"Automation","settings.automation_desc":"Choose how much Home Intelligence may act for you.","settings.adjust":"What do you want to adjust?","settings.adjust_desc":"Settings are grouped by the part of your energy system you want to influence.","settings.effective":"Effective behavior","settings.participants":"Participating assets","metering.period":"Measurement period","metering.attention":"Metering attention","metering.attention_desc":"Resolve the selected period before relying on its totals.","metering.flexible_loads":"Flexible Loads","value.financial_result":"Financial result","value.pricing_settings":"Pricing settings","value.flexible_pricing":"Pricing of flexible loads","value.consumer_allocation":"Consumer allocation","planning.tactical":"Tactical planning","planning.strategic":"Strategic Planning","planning.not_available":"Strategy not available","planning.solar_generation":"Solar generation","planning.solar_unavailable":"Solar generation details are not available yet","planning.no_renderer":"This navigation target has no dedicated renderer.","appearance.description":"Choose the representative image. The selection is persisted by the owning domain and confirmed by readback.","common.horizon":"Horizon","common.period":"Period","common.status":"Status","common.default":"Default","common.name":"Name","common.this_hour":"This hour","common.week":"Week","common.month":"Month","common.year":"Year","common.highest_value":"Highest value","common.lowest_value":"Lowest value","pricing.export_compensation":"Export compensation","pricing.export_fee":"Export fee","pricing.commodity":"Commodity","pricing.network":"Network","pricing.taxes_levies":"Taxes & levies","pricing.vat":"VAT","hero.energy_overview":"Energy overview","hero.site_consumption":"Site Consumption","hero.energy_outlook":"Energy outlook","hero.live_flow":"Live energy flow","hero.solar_unavailable":"Solar production unavailable","hero.generating":"Generating now","hero.not_generating":"Not generating","hero.settings":"Settings","hero.operational_planning":"Operational Planning","hero.metering":"Metering","hero.home_intelligence":"Home Intelligence","hero.energy_retrospective":"Energy retrospective","hero.energy_value":"Energy value","overview.producing_now":"Producing now","overview.grid_import":"Grid Import","overview.importing":"Importing","overview.flex_contributor":"Flexible Load contributor","automation.mode":"Automation mode","automation.quick_action":"Quick action","automation.control":"Home Intelligence control","connection.not_connected":"Not connected","connection.connect_hint":"Connect to enable planning and charging.","connection.disabled_hint":"This load is disabled and excluded from planning.","connection.connected":"Connected","control.requested_charge_power":"Requested charge power","control.requested_charge_power_desc":"Charging power requested from this asset.","relationship.part_of":"Part of","battery.system":"Battery system","battery.power_now":"Power now","battery.soc":"State of charge","battery.capacity":"Capacity","battery.available_energy":"Available energy","solar.production_now":"Production now","automation.authority":"Automation authority","consumer.managed":"Managed flexible assets","consumer.managed_desc":"Primary cards show current power and energy need. Details contain additional user information; technical evidence stays in diagnostics.","retro.planning_outcomes":"Planning outcomes","retro.execution_results":"Execution results","retro.measured_energy":"Measured energy","retro.open_period":"Open period review","retro.weekly":"Weekly review","intelligence.current_situation":"Current situation","planning.solar":"Solar","planning.battery_out":"Home Battery out","planning.grid_in":"Grid in","planning.home":"Home","planning.battery_in":"Home Battery in","planning.grid_out":"Grid out","planning.hourly_desc":"Hourly view of expected production, consumption, storage and grid exchange."
  }),
  nl:Object.freeze({
    "nav.energy":"Energie","nav.overview":"Overzicht","nav.flow":"Stromen","nav.solar":"Zonne-energie","nav.battery":"Thuisbatterij","nav.consumption":"Verbruik","nav.gas":"Gas",
    "nav.intelligence":"Intelligentie","nav.plan":"Planning","nav.operational_plan":"Nu","nav.tactical_plan":"Vandaag & morgen","nav.strategic_plan":"Lange termijn","nav.settings":"Instellingen","nav.insights":"Inzichten","nav.performance":"Prestaties","nav.value":"Waarde","nav.retrospective":"Terugblik",
    "hero.overview.title":"Energieoverzicht","hero.overview.description":"Zie wat je woning nu produceert, verbruikt, opslaat en uitwisselt.",
    "hero.flow.title":"Energiestromen","hero.flow.description":"Zie waar energie nu vandaan komt en waar ze naartoe gaat.",
    "hero.solar.title":"Zonne-energie","hero.solar.description":"Zie de huidige zonneproductie en welke installatieonderdelen daaraan bijdragen.",
    "hero.battery.title":"Thuisbatterij","hero.battery.description":"Zie de opgeslagen energie, de huidige batterijactiviteit en de reserve voor je woning.",
    "hero.consumption.title":"Verbruik","hero.consumption.description":"Zie waar energie wordt gebruikt en welke flexibele verbruikers gepland kunnen worden.",
    "hero.gas.title":"Gas","hero.gas.description":"Bekijk het gasverbruik doorheen de tijd en of metingen beschikbaar zijn.",
    "hero.plan.title":"Planning","hero.plan.description":"Zie wat nu, vandaag en morgen moet gebeuren en wat nog aandacht nodig heeft.",
    "hero.settings.title":"Instellingen","hero.settings.description":"Pas aan hoe Home Intelligence je energie mag beheren binnen de beschikbare opties.",
    "hero.performance.title":"Prestaties","hero.performance.description":"Bekijk gemeten energie en hoe Home Intelligence heeft gepresteerd.",
    "hero.value.title":"Waarde","hero.value.description":"Zie het financiële resultaat van je energiesysteem voor de gekozen periode.",
    "hero.retrospective.title":"Terugblik","hero.retrospective.description":"Zie wat goed werkte, wat aandacht nodig heeft en waar nog informatie ontbreekt.",
    "common.quick_actions":"Snelle acties","common.not_available":"Niet beschikbaar","common.not_measured":"Niet gemeten","common.unknown":"Onbekend",
    "common.details":"Details","common.diagnostics":"Diagnose","common.configuration":"Configuratie","common.children":"Onderdelen","common.save":"Opslaan","common.cancel":"Annuleren","common.reset":"Herstellen",
    "common.today":"Vandaag","common.tomorrow":"Morgen","common.information_missing":"Deze informatie is nog niet beschikbaar.",
    "reason.intelligence_off":"Energie-intelligentie staat uit","reason.automation_disabled":"Automatisering is uitgeschakeld","reason.disabled":"Uitgeschakeld","reason.not_available":"Niet beschikbaar","reason.not_published":"Deze informatie is nog niet beschikbaar.","reason.no_battery_policy":"Informatie over het batterijbeleid is nog niet beschikbaar","reason.data_incomplete":"Sommige details zijn niet beschikbaar","reason.verification_required":"Controle is nodig","reason.reset_pending":"Herstel wordt uitgevoerd","reason.confirmation_needed":"Bevestiging nodig","reason.waiting":"Wachten","reason.preparing":"Voorbereiden","reason.not_configured":"Instelling nodig","common.appearance":"Weergave","common.choose_appearance":"Weergave kiezen","common.selected":"Geselecteerd","common.save_appearance":"Weergave opslaan","common.automatic":"Automatisch","common.off":"Uit","common.advice":"Advies","common.forced":"Geforceerd","common.high":"Hoog","common.normal":"Normaal","common.low":"Laag","section.production_supply":"Productie & aanvoer","section.production_supply_desc":"Energie die nu voor de woning beschikbaar is.","section.consumption_desc":"Totaalverbruik en de actieve componenten ervan.","section.flexible_loads":"Flexibele verbruikers","section.flexible_loads_desc":"Huidige uitvoering, volgende actie, gevraagd vermogen en operationele reden. Hardwareconfiguratie wordt hier niet getoond.","section.other_assets":"Andere assets","section.supply":"Aanvoer","section.supply_desc":"Verwachte bruikbare energie voor de gekozen horizon.","section.demand":"Vraag","section.demand_desc":"Verwacht woningverbruik, flexibele verbruikers en batterijladen.","section.grid_impact":"Netimpact","section.grid_impact_desc":"Verwachte netuitwisseling voor de gekozen horizon.","flow.physical":"Fysieke energiestroom","flow.physical_desc":"Alleen live gemeten energiestromen. Uitgeschakelde en enkel geplande assets zijn uitgesloten.","flow.producers":"Producenten","flow.consumers":"Verbruikers","flow.charging_connections":"Laadverbindingen","flow.charging_connections_desc":"Laadpunten en voertuigtoewijzingen die momenteel zichtbaar zijn voor Energy.","flow.physical_consumers":"Fysieke verbruikers","flow.physical_consumers_desc":"Deelnemende verbruikers en hun huidige laadverbinding; inactieve assets blijven zichtbaar.","gas.history":"Historiek gasverbruik","gas.meter":"Gasmeter","gas.meter_desc":"Huidige meterstatus en gemeten waarden.","gas.connect":"Verbind je gasmeter","gas.connect_desc":"Verbind een gasmeter voordat verbruikshistoriek kan worden getoond.","battery.state":"Status thuisbatterij","battery.state_desc":"Gecombineerde operationele waarheid voor het thuisbatterijsysteem.","battery.contributors":"Onderdelen thuisbatterij","battery.contributors_desc":"Fysieke batterijen die bijdragen aan het totaal.","settings.automation":"Automatisering","settings.automation_desc":"Kies hoeveel Home Intelligence voor jou mag uitvoeren.","settings.adjust":"Wat wil je aanpassen?","settings.adjust_desc":"Instellingen zijn gegroepeerd volgens het deel van je energiesysteem dat je wilt beïnvloeden.","settings.effective":"Effectief gedrag","settings.participants":"Deelnemende assets","metering.period":"Meetperiode","metering.attention":"Aandacht voor metingen","metering.attention_desc":"Los problemen voor de gekozen periode op voordat je op de totalen vertrouwt.","metering.flexible_loads":"Flexibele verbruikers","value.financial_result":"Financieel resultaat","value.pricing_settings":"Prijsinstellingen","value.flexible_pricing":"Prijs van flexibele verbruikers","value.consumer_allocation":"Verdeling over verbruikers","planning.tactical":"Tactische planning","planning.strategic":"Strategische planning","planning.not_available":"Strategie niet beschikbaar","planning.solar_generation":"Zonneproductie","planning.solar_unavailable":"Details over zonneproductie zijn nog niet beschikbaar","planning.no_renderer":"Voor dit navigatiedoel is nog geen aparte weergave beschikbaar.","appearance.description":"Kies de representatieve afbeelding. De keuze wordt door het owning domain opgeslagen en via readback bevestigd.","common.horizon":"Horizon","common.period":"Periode","common.status":"Status","common.default":"Standaard","common.name":"Naam","common.this_hour":"Dit uur","common.week":"Week","common.month":"Maand","common.year":"Jaar","common.highest_value":"Hoogste waarde","common.lowest_value":"Laagste waarde","pricing.export_compensation":"Injectievergoeding","pricing.export_fee":"Injectiekost","pricing.commodity":"Energieprijs","pricing.network":"Netkosten","pricing.taxes_levies":"Belastingen & heffingen","pricing.vat":"BTW","hero.energy_overview":"Energieoverzicht","hero.site_consumption":"Woningverbruik","hero.energy_outlook":"Energievooruitzicht","hero.live_flow":"Live energiestroom","hero.solar_unavailable":"Zonneproductie niet beschikbaar","hero.generating":"Produceert nu","hero.not_generating":"Produceert niet","hero.settings":"Instellingen","hero.operational_planning":"Operationele planning","hero.metering":"Metingen","hero.home_intelligence":"Home Intelligence","hero.energy_retrospective":"Energieterugblik","hero.energy_value":"Energiewaarde","overview.producing_now":"Produceert nu","overview.grid_import":"Netafname","overview.importing":"Afname","overview.flex_contributor":"Bijdrage flexibele verbruiker","automation.mode":"Automatiseringsmodus","automation.quick_action":"Snelle actie","automation.control":"Home Intelligence-bediening","connection.not_connected":"Niet verbonden","connection.connect_hint":"Verbind om planning en laden mogelijk te maken.","connection.disabled_hint":"Deze verbruiker is uitgeschakeld en uitgesloten van planning.","connection.connected":"Verbonden","control.requested_charge_power":"Gevraagd laadvermogen","control.requested_charge_power_desc":"Laadvermogen dat voor deze asset wordt gevraagd.","relationship.part_of":"Onderdeel van","battery.system":"Batterijsysteem","battery.power_now":"Vermogen nu","battery.soc":"Laadniveau","battery.capacity":"Capaciteit","battery.available_energy":"Beschikbare energie","solar.production_now":"Productie nu","automation.authority":"Automatiseringsbevoegdheid","consumer.managed":"Beheerde flexibele verbruikers","consumer.managed_desc":"Primaire kaarten tonen huidig vermogen en energiebehoefte. Details bevatten extra gebruikersinformatie; technische evidence blijft in diagnose.","retro.planning_outcomes":"Planningsresultaten","retro.execution_results":"Uitvoeringsresultaten","retro.measured_energy":"Gemeten energie","retro.open_period":"Open periode-evaluatie","retro.weekly":"Wekelijkse evaluatie","intelligence.current_situation":"Huidige situatie","planning.solar":"Zonne-energie","planning.battery_out":"Thuisbatterij uit","planning.grid_in":"Netafname","planning.home":"Woning","planning.battery_in":"Thuisbatterij in","planning.grid_out":"Netinjectie","planning.hourly_desc":"Uurweergave van verwachte productie, verbruik, opslag en netuitwisseling."
  }),
  fr:Object.freeze({
    "nav.energy":"Énergie","nav.overview":"Vue d’ensemble","nav.flow":"Flux","nav.solar":"Solaire","nav.battery":"Batterie domestique","nav.consumption":"Consommation","nav.gas":"Gaz",
    "nav.intelligence":"Intelligence","nav.plan":"Planification","nav.operational_plan":"Maintenant","nav.tactical_plan":"Aujourd’hui & demain","nav.strategic_plan":"Long terme","nav.settings":"Réglages","nav.insights":"Analyses","nav.performance":"Performance","nav.value":"Valeur","nav.retrospective":"Bilan",
    "hero.overview.title":"Vue d’ensemble de l’énergie","hero.overview.description":"Voyez ce que votre habitation produit, consomme, stocke et échange en ce moment.",
    "hero.flow.title":"Flux d’énergie","hero.flow.description":"Voyez d’où vient l’énergie et où elle va en ce moment.",
    "hero.solar.title":"Solaire","hero.solar.description":"Voyez la production solaire actuelle et les équipements qui y contribuent.",
    "hero.battery.title":"Batterie domestique","hero.battery.description":"Voyez l’énergie stockée, l’activité actuelle de la batterie et la réserve disponible.",
    "hero.consumption.title":"Consommation","hero.consumption.description":"Voyez où l’énergie est utilisée et quelles charges flexibles peuvent être planifiées.",
    "hero.gas.title":"Gaz","hero.gas.description":"Consultez la consommation de gaz et vérifiez si les mesures sont disponibles.",
    "hero.plan.title":"Planification","hero.plan.description":"Voyez ce qui doit se passer maintenant, aujourd’hui et demain, et ce qui demande encore votre attention.",
    "hero.settings.title":"Réglages","hero.settings.description":"Ajustez la manière dont Home Intelligence peut gérer votre énergie dans les limites disponibles.",
    "hero.performance.title":"Performance","hero.performance.description":"Consultez l’énergie mesurée et les performances de Home Intelligence.",
    "hero.value.title":"Valeur","hero.value.description":"Voyez le résultat financier de votre système énergétique pour la période sélectionnée.",
    "hero.retrospective.title":"Bilan","hero.retrospective.description":"Voyez ce qui a fonctionné, ce qui demande votre attention et où des informations manquent encore.",
    "common.quick_actions":"Actions rapides","common.not_available":"Non disponible","common.not_measured":"Non mesuré","common.unknown":"Inconnu",
    "common.details":"Détails","common.diagnostics":"Diagnostic","common.configuration":"Configuration","common.children":"Éléments","common.save":"Enregistrer","common.cancel":"Annuler","common.reset":"Réinitialiser",
    "common.today":"Aujourd’hui","common.tomorrow":"Demain","common.information_missing":"Cette information n’est pas encore disponible.",
    "reason.intelligence_off":"L’intelligence énergétique est désactivée","reason.automation_disabled":"L’automatisation est désactivée","reason.disabled":"Désactivé","reason.not_available":"Non disponible","reason.not_published":"Cette information n’est pas encore disponible.","reason.no_battery_policy":"Les informations sur la politique de batterie ne sont pas encore disponibles","reason.data_incomplete":"Certains détails ne sont pas disponibles","reason.verification_required":"Une vérification est nécessaire","reason.reset_pending":"Réinitialisation en cours","reason.confirmation_needed":"Confirmation nécessaire","reason.waiting":"En attente","reason.preparing":"Préparation","reason.not_configured":"Configuration nécessaire","common.appearance":"Apparence","common.choose_appearance":"Choisir l’apparence","common.selected":"Sélectionné","common.save_appearance":"Enregistrer l’apparence","common.automatic":"Automatique","common.off":"Désactivé","common.advice":"Conseil","common.forced":"Forcé","common.high":"Haute","common.normal":"Normale","common.low":"Basse","section.production_supply":"Production & alimentation","section.production_supply_desc":"Énergie disponible pour l’habitation maintenant.","section.consumption_desc":"Demande du site et ses composants actifs.","section.flexible_loads":"Charges flexibles","section.flexible_loads_desc":"Exécution actuelle, prochaine action, puissance demandée et raison opérationnelle. La configuration matérielle n’est pas affichée ici.","section.other_assets":"Autres équipements","section.supply":"Alimentation","section.supply_desc":"Énergie utilisable prévue pour l’horizon sélectionné.","section.demand":"Demande","section.demand_desc":"Consommation domestique, charges flexibles et charge du stockage prévues.","section.grid_impact":"Impact réseau","section.grid_impact_desc":"Échange réseau prévu pour l’horizon sélectionné.","flow.physical":"Flux d’énergie physique","flow.physical_desc":"Uniquement les flux d’énergie mesurés en direct. Les équipements désactivés ou uniquement planifiés sont exclus.","flow.producers":"Producteurs","flow.consumers":"Consommateurs","flow.charging_connections":"Connexions de charge","flow.charging_connections_desc":"Bornes et attributions de véhicules actuellement visibles dans Energy.","flow.physical_consumers":"Consommateurs physiques","flow.physical_consumers_desc":"Charges participantes et leur connexion de charge actuelle; les équipements inactifs restent visibles.","gas.history":"Historique de consommation de gaz","gas.meter":"Compteur de gaz","gas.meter_desc":"État actuel du compteur et valeurs mesurées.","gas.connect":"Connectez votre compteur de gaz","gas.connect_desc":"Connectez un compteur avant d’afficher l’historique de consommation.","battery.state":"État de la batterie domestique","battery.state_desc":"État opérationnel combiné du système de batterie domestique.","battery.contributors":"Composants de la batterie domestique","battery.contributors_desc":"Batteries physiques contribuant à l’ensemble.","settings.automation":"Automatisation","settings.automation_desc":"Choisissez dans quelle mesure Home Intelligence peut agir pour vous.","settings.adjust":"Que voulez-vous ajuster ?","settings.adjust_desc":"Les réglages sont regroupés selon la partie de votre système énergétique à influencer.","settings.effective":"Comportement effectif","settings.participants":"Équipements participants","metering.period":"Période de mesure","metering.attention":"Attention aux mesures","metering.attention_desc":"Résolvez la période sélectionnée avant de vous fier à ses totaux.","metering.flexible_loads":"Charges flexibles","value.financial_result":"Résultat financier","value.pricing_settings":"Réglages des prix","value.flexible_pricing":"Tarification des charges flexibles","value.consumer_allocation":"Répartition par consommateur","planning.tactical":"Planification tactique","planning.strategic":"Planification stratégique","planning.not_available":"Stratégie indisponible","planning.solar_generation":"Production solaire","planning.solar_unavailable":"Les détails de production solaire ne sont pas encore disponibles","planning.no_renderer":"Cette destination de navigation n’a pas encore de vue dédiée.","appearance.description":"Choisissez l’image représentative. La sélection est enregistrée par le domaine propriétaire et confirmée par lecture.","common.horizon":"Horizon","common.period":"Période","common.status":"État","common.default":"Par défaut","common.name":"Nom","common.this_hour":"Cette heure","common.week":"Semaine","common.month":"Mois","common.year":"Année","common.highest_value":"Valeur la plus élevée","common.lowest_value":"Valeur la plus faible","pricing.export_compensation":"Rémunération d’injection","pricing.export_fee":"Frais d’injection","pricing.commodity":"Énergie","pricing.network":"Réseau","pricing.taxes_levies":"Taxes & prélèvements","pricing.vat":"TVA","hero.energy_overview":"Vue d’ensemble énergétique","hero.site_consumption":"Consommation du site","hero.energy_outlook":"Prévision énergétique","hero.live_flow":"Flux d’énergie en direct","hero.solar_unavailable":"Production solaire indisponible","hero.generating":"Production en cours","hero.not_generating":"Pas de production","hero.settings":"Réglages","hero.operational_planning":"Planification opérationnelle","hero.metering":"Mesures","hero.home_intelligence":"Home Intelligence","hero.energy_retrospective":"Bilan énergétique","hero.energy_value":"Valeur énergétique","overview.producing_now":"Production en cours","overview.grid_import":"Import réseau","overview.importing":"Importation","overview.flex_contributor":"Contribution d’une charge flexible","automation.mode":"Mode d’automatisation","automation.quick_action":"Action rapide","automation.control":"Contrôle Home Intelligence","connection.not_connected":"Non connecté","connection.connect_hint":"Connectez pour permettre la planification et la charge.","connection.disabled_hint":"Cette charge est désactivée et exclue de la planification.","connection.connected":"Connecté","control.requested_charge_power":"Puissance de charge demandée","control.requested_charge_power_desc":"Puissance de charge demandée à cet équipement.","relationship.part_of":"Fait partie de","battery.system":"Système de batterie","battery.power_now":"Puissance actuelle","battery.soc":"État de charge","battery.capacity":"Capacité","battery.available_energy":"Énergie disponible","solar.production_now":"Production actuelle","automation.authority":"Autorité d’automatisation","consumer.managed":"Charges flexibles gérées","consumer.managed_desc":"Les cartes principales montrent la puissance actuelle et le besoin énergétique. Les détails contiennent les informations utilisateur supplémentaires; les preuves techniques restent dans le diagnostic.","retro.planning_outcomes":"Résultats de planification","retro.execution_results":"Résultats d’exécution","retro.measured_energy":"Énergie mesurée","retro.open_period":"Bilan de période ouverte","retro.weekly":"Bilan hebdomadaire","intelligence.current_situation":"Situation actuelle","planning.solar":"Solaire","planning.battery_out":"Batterie domestique sortante","planning.grid_in":"Import réseau","planning.home":"Habitation","planning.battery_in":"Batterie domestique entrante","planning.grid_out":"Injection réseau","planning.hourly_desc":"Vue horaire de la production, consommation, stockage et échange réseau prévus."
  })
});
let RHI_ENERGY_LOCALE="en";
function rhiEnergyLocale(hass=null){
  const raw=hass?.locale?.language || hass?.language || RHI_ENERGY_LOCALE || globalThis?.document?.documentElement?.lang || "en";
  return String(raw||"en").replace(/_/g,"-");
}
function rhiEnergySetLocaleFromHass(hass=null){RHI_ENERGY_LOCALE=rhiEnergyLocale(hass);return RHI_ENERGY_LOCALE;}
function rhiEnergyT(hass,key,params={},fallback=""){return rhiUxTranslate(RHI_ENERGY_TRANSLATIONS,key,{locale:rhiEnergyLocale(hass),params,fallback});}
function rhiEnergyFormatNumber(hass,value,options={}){return rhiUxFormatNumber(value,{locale:rhiEnergyLocale(hass),...options});}
function rhiEnergyFormatCurrency(hass,value,currency="EUR",options={}){return rhiUxFormatCurrency(value,currency,{locale:rhiEnergyLocale(hass),...options});}
function rhiEnergyFormatPercent(hass,value,options={}){return rhiUxFormatPercent(value,{locale:rhiEnergyLocale(hass),...options});}

// ---- src/app/presentation.js ----
// Energy presentation grammar.
// Owns navigation metadata, tab hero assets, shared visual hierarchy and card primitives.
// Domain semantics, calculations, actions and runtime truth remain backend/domain owned.

const HB_ENERGY_NAVIGATION_SPEC = Object.freeze([
  {
    id:"energy", labelKey:"nav.energy", fallback:"Energy",
    items:[
      { id:"overview", labelKey:"nav.overview", fallback:"Overview", view:"overview", titleKey:"hero.overview.title", descriptionKey:"hero.overview.description" },
      { id:"flow", labelKey:"nav.flow", fallback:"Flow", view:"flow", titleKey:"hero.flow.title", descriptionKey:"hero.flow.description" },
      { id:"solar", labelKey:"nav.solar", fallback:"Solar", view:"solar", titleKey:"hero.solar.title", descriptionKey:"hero.solar.description" },
      { id:"battery", labelKey:"nav.battery", fallback:"Home Battery", view:"battery", titleKey:"hero.battery.title", descriptionKey:"hero.battery.description" },
      { id:"consumers", labelKey:"nav.consumption", fallback:"Consumption", view:"consumers", titleKey:"hero.consumption.title", descriptionKey:"hero.consumption.description" },
      { id:"gas", labelKey:"nav.gas", fallback:"Gas", view:"gas", titleKey:"hero.gas.title", descriptionKey:"hero.gas.description" }
    ]
  },
  {
    id:"intelligence", labelKey:"nav.intelligence", fallback:"Intelligence",
    items:[
      { id:"plan", labelKey:"nav.plan", fallback:"Plan", view:"planning", titleKey:"hero.plan.title", descriptionKey:"hero.plan.description" },
      { id:"settings", labelKey:"nav.settings", fallback:"Settings", view:"strategies", titleKey:"hero.settings.title", descriptionKey:"hero.settings.description" }
    ]
  },
  {
    id:"insights", labelKey:"nav.insights", fallback:"Insights",
    items:[
      { id:"metering", labelKey:"nav.performance", fallback:"Performance", view:"metering", titleKey:"hero.performance.title", descriptionKey:"hero.performance.description" },
      { id:"value", labelKey:"nav.value", fallback:"Value", view:"value", titleKey:"hero.value.title", descriptionKey:"hero.value.description" },
      { id:"retrospective", labelKey:"nav.retrospective", fallback:"Retrospective", view:"retrospective", titleKey:"hero.retrospective.title", descriptionKey:"hero.retrospective.description" }
    ]
  }
]);

function hbEnergyNavigation(hass = null) {
  return HB_ENERGY_NAVIGATION_SPEC.map(section => ({
    id:section.id,
    label:rhiEnergyT(hass,section.labelKey,{},section.fallback),
    items:section.items.map(item => ({
      ...item,
      label:rhiEnergyT(hass,item.labelKey,{},item.fallback),
      title:rhiEnergyT(hass,item.titleKey,{},item.fallback),
      description:rhiEnergyT(hass,item.descriptionKey,{},"")
    }))
  }));
}

const HB_ENERGY_HERO_ASSETS = Object.freeze({
  overview: "heroes/overview-hero.webp",
  flow: "heroes/flow-hero.webp",
  solar: "heroes/solar-hero.webp",
  "solar-generation": "heroes/solar-hero.webp",
  battery: "heroes/battery-hero.webp",
  consumers: "heroes/consumers-hero.webp",
  gas: "heroes/gas-page-hero-v3.webp",
  strategy: "heroes/strategies-hero.webp",
  strategies: "heroes/strategies-hero.webp",
  intelligence: "heroes/intelligence-hero.webp",
  "operational-planning": "heroes/planning-hero.webp",
  outlook: "heroes/outlook-hero.webp",
  "tactical-planning": "heroes/planning-hero.webp",
  planning: "heroes/planning-hero.webp",
  "strategic-planning": "heroes/strategies-hero.webp",
  metering: "heroes/metering-hero.webp",
  value: "heroes/value-hero.webp",
  retrospective: "heroes/diagnostics-hero.webp"
});

const HB_ENERGY_PROFILE_ALIASES = Object.freeze({
  "solar-generation": "solar",
  planning: "outlook",
  settings: "strategies",
  "strategic-planning": "strategies"
});

function hbEnergyAssetUrl(relativePath = "") {
  const normalized = String(relativePath || "").replace(/^\/+/, "");
  return `/hacsfiles/rhi-energy-ux/assets/${normalized}?v=${encodeURIComponent(UX_VERSION)}`;
}

function hbEnergyHeroAsset(tab = "overview") {
  return hbEnergyAssetUrl(HB_ENERGY_HERO_ASSETS[tab] || HB_ENERGY_HERO_ASSETS.overview);
}

function hbEnergyProfileKey(tab = "overview") {
  return HB_ENERGY_PROFILE_ALIASES[tab] || tab;
}

function hbEnergyPresentationStyles() {
  return `${rhiUxCoreStyles()}
    :host{
      /* Transitional aliases for domain-local styles. Shared primitives use --rhi-* directly. */
      --rhi-line:var(--rhi-color-line);
      --rhi-ink:var(--rhi-color-text);
      --rhi-muted:var(--rhi-color-muted);
      --rhi-blue:var(--rhi-color-primary);
      --rhi-surface:var(--rhi-color-surface);
      --rhi-soft:var(--rhi-color-surface-soft);
      --rhi-shadow:var(--rhi-shadow-md);
      --rhi-card-gap:var(--rhi-space-2);
    }
    .rhiEnergyNav-intelligence{--rhi-nav-active-bg:#F1EDFF;--rhi-nav-active-border:#DFD5FB;--rhi-nav-active-text:#5A38B3}
    .rhiEnergyNav-insights{--rhi-nav-active-bg:#E7F7F4;--rhi-nav-active-border:#CDEBE6;--rhi-nav-active-text:#176E67}
    .rhiEnergyPageHeader{display:block;margin:0 0 10px}
    @media(max-width:760px){
    }
    .rhi-context-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--rhi-space-2)}
    .rhi-context-card{min-width:0;border:1px solid var(--rhi-color-line);border-radius:var(--rhi-radius-lg);background:var(--rhi-color-surface);box-shadow:var(--rhi-shadow-sm);padding:14px 16px}
    .rhi-data-list{display:grid;gap:6px}
    .rhi-data-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:9px 10px;border:1px solid #EDF1F6;border-radius:var(--rhi-radius-sm);background:var(--rhi-color-surface-soft)}
    @media(max-width:760px){.rhi-context-grid{grid-template-columns:1fr}}
  `;
}

// ---- src/ui/components/page-header.js ----
// Energy domain adapter onto shared RHI UX Core presentation primitives.
// Page-level header owns Hero, Status and executable Quick Actions only.
// Body-scoped view/filter controls are rendered immediately above the content they govern.
function rhiEnergyPageHeader({
  sectionLabel = "",
  itemLabel = "",
  title = "",
  description = "",
  hero = "",
  metrics = [],
  commandActions = "",
  tone = ""
} = {}) {
  const eyebrow = [sectionLabel, itemLabel].filter(Boolean).join(" / ");
  const heroMarkup = rhiUxPageHero({ eyebrow, title, description, image:hero, imageAlt:"" });
  const statusMarkup = rhiUxStatusGrid((metrics || []).map(([icon,label,value,detail]) => ({
    icon:icon || "•", label:label || "", value:value ?? "—", detail:detail || ""
  })));
  const actionsMarkup = commandActions
    ? `<section class="rhiUxQuickActionBar" aria-label="${rhiUxEscape(rhiEnergyT(null,'common.quick_actions',{},'Quick actions'))}"><small>${rhiUxEscape(rhiEnergyT(null,'common.quick_actions',{},'Quick actions'))}</small><div class="rhiUxQuickActions">${commandActions}</div></section>`
    : "";
  return `<section class="rhiEnergyPageHeader rhiUxPageStack ${rhiUxEscape(tone)}">${heroMarkup}${statusMarkup}${actionsMarkup}</section>`;
}

// ---- src/ui/components/energy-visual-picker.js ----
// Compact Energy logical-device image editor.
// Presentation-only: selection is drafted in the card and persisted only on explicit Save.
class HomeBrainEnergyVisualPicker {
  constructor() {}

  catalogFor(asset = {}) {
    const type = String(asset.asset_type || asset.object_class || "").trim().toLowerCase();
    return typeof rhiEnergyVisualCatalogForType === "function" ? rhiEnergyVisualCatalogForType(type) : [];
  }

  render(asset = {}, selectedRef = "", { draftRef = "", brand = "all" } = {}) {
    const assetId = String(asset.asset_id || asset.id || "").trim();
    const type = String(asset.asset_type || asset.object_class || "").trim().toLowerCase();
    const choices = this.catalogFor(asset);
    if (!assetId || !type || !choices.length) return "";

    const current = String(draftRef || selectedRef || "").trim();
    const brands = typeof rhiEnergyVisualBrandsForType === "function"
      ? rhiEnergyVisualBrandsForType(type)
      : [...new Set(choices.map(entry => String(entry.brand || "").trim()).filter(Boolean))].sort();
    const activeBrand = brand !== "all" && brands.includes(brand) ? brand : "all";
    const visible = activeBrand === "all" ? choices : choices.filter(entry => String(entry.brand || "") === activeBrand);

    const filtersHtml = rhiUxVisualFilterButtons({ values:brands, active:activeBrand, attribute:"data-energy-visual-brand" });

    const choicesHtml = visible.map(entry => {
      const ref = rhiEnergyVisualRef(entry);
      const visual = typeof resolveEnergyVisualRef === "function" ? resolveEnergyVisualRef(ref) : null;
      const selected = ref === current;
      return rhiUxVisualChoice({id:ref,image:visual?.url || "",label:entry.model || entry.label,eyebrow:entry.brand || "Representative",detail:entry.variant || human(type),selected,attributes:{"data-energy-visual-select":ref,"data-energy-visual-asset":assetId}});
    }).join("");

    const resetHtml = `<button type="button" data-energy-visual-reset="${escapeHtml(assetId)}">Use profile default</button>`;
    const cancelHtml = `<button type="button" data-energy-visual-cancel="1">Cancel</button>`;
    const saveHtml = `<button type="button" class="primary" data-energy-visual-save="${escapeHtml(assetId)}" ${current ? "" : "disabled"}>Save appearance</button>`;
    const closeHtml = `<button type="button" class="energyVisualClose" data-energy-visual-cancel="1" aria-label="Cancel">×</button>`;

    return typeof rhiUxVisualPickerShell === "function"
      ? rhiUxVisualPickerShell({
          eyebrow:`${rhiEnergyT(this.hass,"common.appearance",{},"Appearance")} · ${human(type)}`,
          title:rhiEnergyT(this.hass,"common.choose_appearance",{},"Choose appearance"),
          description:rhiEnergyT(this.hass,"appearance.description",{},"Choose the representative image. The selection is persisted by the owning domain and confirmed by readback."),
          filtersHtml,
          choicesHtml,
          resetHtml,
          cancelHtml,
          saveHtml,
          modal:true,
          closeHtml
        }).replace('class="rhiUxVisualPickerBackdrop"', 'class="rhiUxVisualPickerBackdrop" data-energy-visual-backdrop="1"')
      : "";
  }
}

function rhiEnergyVisualPickerStyles() {
  return `
    .assetVisual[data-energy-visual-open]{cursor:pointer;outline:0}
    .assetVisual[data-energy-visual-open]:hover{box-shadow:0 0 0 2px rgba(37,99,235,.16)}
    .energyVisualClose{border:0;background:#f1f5f9;border-radius:10px;width:36px;height:36px;font-size:22px;cursor:pointer}
  `;
}