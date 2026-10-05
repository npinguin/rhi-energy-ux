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

  const assetFieldAliases = Object.freeze({
    'battery.power_kw':['battery.power_kw','power_kw','current_power_kw','actual_power_kw','battery_power_kw'],
    'battery.charge_power_kw':['battery.charge_power_kw','charge_power_kw'],
    'battery.discharge_power_kw':['battery.discharge_power_kw','discharge_power_kw'],
    'battery.soc_pct':['battery.soc_pct','soc_pct','battery_soc_pct'],
    'battery.capacity_kwh':['battery.capacity_kwh','capacity_kwh','battery_capacity_kwh'],
    'battery.available_kwh':['battery.available_kwh','available_kwh','battery_available_kwh'],
    'battery.state':['battery.state','operating_state','state'],
    'battery.reserve_target_pct':['battery.reserve_target_pct','reserve_target_pct'],
    'battery.temperature_c':['battery.temperature_c','temperature_c'],
    'solar.power_kw':['solar.power_kw','power_kw','current_power_kw','solar_power_kw'],
    'solar.energy_today_kwh':['solar.energy_today_kwh','energy_today_kwh'],
    'solar.capacity_kwp':['solar.capacity_kwp','capacity_kwp'],
    'solar.state':['solar.state','operating_state','state'],
    'solar_zone.power_w':['solar_zone.power_w','power_w'],
    'solar_zone.energy_kwh':['solar_zone.energy_kwh','energy_kwh'],
    'solar_zone.status':['solar_zone.status','status','operating_state','state'],
    'solar_zone.child_count':['solar_zone.child_count','child_count'],
    'solar_zone.last_measurement':['solar_zone.last_measurement','last_measurement'],
    'solar_zone.voltage_average_v':['solar_zone.voltage_average_v','voltage_average_v'],
    'solar_zone.current_average_a':['solar_zone.current_average_a','current_average_a'],
    'solar_optimizer.power_w':['solar_optimizer.power_w','optimizer.power_w','power_w','current_power_w'],
    'solar_optimizer.energy_kwh':['solar_optimizer.energy_kwh','optimizer.energy_kwh','energy_kwh'],
    'solar_optimizer.status':['solar_optimizer.status','optimizer.status','status','operating_state','state'],
    'solar_optimizer.last_measurement':['solar_optimizer.last_measurement','optimizer.last_measurement','last_measurement'],
    'solar_optimizer.optimizer_voltage_v':['solar_optimizer.optimizer_voltage_v','optimizer_voltage_v'],
    'solar_optimizer.panel_voltage_v':['solar_optimizer.panel_voltage_v','panel_voltage_v'],
    'solar_optimizer.current_a':['solar_optimizer.current_a','optimizer.current_a','current_a'],
    'solar_optimizer.temperature_c':['solar_optimizer.temperature_c','temperature_c'],
    'solar_optimizer.panel_identity':['solar_optimizer.panel_identity','panel_identity'],
    'inverter.power_kw':['inverter.power_kw','power_kw','current_power_kw','actual_power_kw'],
    'inverter.efficiency_pct':['inverter.efficiency_pct','efficiency_pct'],
    'inverter.state':['inverter.state','operating_state','state'],
    'grid.net_power_kw':['grid.net_power_kw','net_power_kw','power_kw'],
    'grid_import.power_kw':['grid_import.power_kw','import_power_kw','grid_import_power_kw'],
    'grid_export.power_kw':['grid_export.power_kw','export_power_kw','grid_export_power_kw'],
    'grid.flow_direction':['grid.flow_direction','flow_direction','direction'],
    'gas.flow_m3_h':['gas.flow_m3_h','flow_m3_h'],
    'gas.total_m3':['gas.total_m3','total_m3'],
    'gas.state':['gas.state','measurement_state','state'],
    'flexible_load.power_kw':['flexible_load.power_kw','power_kw','current_power_kw','actual_power_kw'],
    'flexible_load.energy_to_target_kwh':['flexible_load.energy_to_target_kwh','energy_to_target_kwh','energy_needed_kwh','remaining_energy_kwh'],
    'flexible_load.state':['flexible_load.state','operating_state','state'],
    'flexible_load.automation_mode':['flexible_load.automation_mode','automation_mode'],
    'consumer.power_kw':['consumer.power_kw','power_kw','current_power_kw','actual_power_kw'],
    'consumer.energy_today_kwh':['consumer.energy_today_kwh','energy_today_kwh'],
    'consumer.state':['consumer.state','operating_state','state'],
    'vehicle.power_kw':['vehicle.power_kw','charging_power_kw','current_power_kw','actual_power_kw','power_kw'],
    'vehicle.energy_to_target_kwh':['vehicle.energy_to_target_kwh','energy_to_target_kwh','energy_needed_kwh','remaining_energy_kwh'],
    'vehicle.soc_pct':['vehicle.soc_pct','soc_pct'],
    'vehicle.state':['vehicle.state','charging_state','operating_state','state'],
    'charger.power_kw':['charger.power_kw','current_power_kw','actual_power_kw','power_kw'],
    'charger.requested_power_kw':['charger.requested_power_kw','requested_power_kw'],
    'charger.state':['charger.state','connection_state','operating_state','state'],
    'site_consumption.power_kw':['site_consumption.power_kw','consumption.power_kw','power_kw','current_power_kw','site_consumption_kw'],
    'site_consumption.energy_today_kwh':['site_consumption.energy_today_kwh','consumption.energy_today_kwh','energy_today_kwh'],
    'site_consumption.state':['site_consumption.state','consumption.state','measurement_state','state'],
    'home_consumption.power_kw':['home_consumption.power_kw','consumption.power_kw','power_kw','current_power_kw','home_consumption_kw'],
    'home_consumption.energy_today_kwh':['home_consumption.energy_today_kwh','consumption.energy_today_kwh','energy_today_kwh'],
    'home_consumption.state':['home_consumption.state','consumption.state','measurement_state','state'],
    'backup.power_kw':['backup.power_kw','power_kw','current_power_kw'],
    'backup.state':['backup.state','operating_state','state'],
    'backup.grid_state':['backup.grid_state','grid_state'],
    'energy.net_power_kw':['energy.net_power_kw','net_power_kw','power_kw'],
    'energy.state':['energy.state','operating_state','state']
  });;
  const aggregateObject = types => {
    const wanted = new Set((Array.isArray(types) ? types : [types]).map(value => String(value || '').toLowerCase()));
    return objects.find(row => wanted.has(String(row.asset_type || row.object_class || '').toLowerCase())) || null;
  };
  const assetField = (assetId, key) => {
    const id = String(assetId || '');
    const semanticKey = String(key || '');
    const asset = id ? objectById.get(id) : null;
    if (!asset) return semantic({value:null,status:'UNAVAILABLE',quality:'UNKNOWN',reason:'asset_not_published'});
    const scoped = propertyByAssetAndKey.get(`${id}::${semanticKey}`) || null;
    if (scoped) {
      const projected = semantic(scoped);
      if (projected.resolved || projected.value !== null) return projected;
    }
    for (const alias of assetFieldAliases[semanticKey] || []) {
      if (Object.prototype.hasOwnProperty.call(asset, alias)) {
        const value = asset[alias];
        if (value !== undefined && value !== null && value !== '') {
          return semantic({
            value,
            status:'AVAILABLE',
            quality:'CANONICAL',
            reason:null,
            source_asset_id:id,
            source_field:alias
          });
        }
      }
    }
    return semantic({value:null,status:'UNAVAILABLE',quality:'UNKNOWN',reason:'canonical_asset_field_not_published'});
  };

  const aggregateField = (types, key) => {
    const aggregate = aggregateObject(types);
    if (aggregate) {
      const projected = assetField(String(aggregate.asset_id || ''), key);
      if (projected.resolved || projected.value !== null) return projected;
    }
    return coreByKey.get(String(key || '')) || semantic({value:null,status:'UNAVAILABLE',quality:'UNKNOWN',reason:'canonical_field_not_published'});
  };

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
    aggregateObject,
    aggregateField,
    assetField,
    object(assetId) { return objectById.get(String(assetId || '')) || null; },
    profile(profileId) { return profileById.get(String(profileId || '')) || null; },
    property(key, assetId = '') {
      const id = String(assetId || '');
      return id ? (propertyByAssetAndKey.get(`${id}::${String(key || '')}`) || null) : (propertyByKey.get(String(key || '')) || null);
    },
    field(key, assetId = '') {
      if (assetId) return assetField(String(assetId || ''), String(key || ''));
      if (coreByKey.has(String(key || ''))) return coreByKey.get(String(key || ''));
      return semantic(this.property(key));
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
    property(key) { return v2.assetField(assetId, key); },
    relationships:Object.freeze(relationships),
    controls:Object.freeze(controls),
    profile,
    raw:asset
  });
}
