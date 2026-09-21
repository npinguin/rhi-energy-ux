// ---- src/runtime/public-interface-registry.js ----
// Canonical public UX interface registry. Product code never probes suffixes,
  // aliases, internal resolution indexes, or diagnostics indexes.
  const UX_INTERFACES = Object.freeze({
    release: RELEASE_ENTITY,
    pilotReadiness: 'sensor.energy_pilot_readiness',
    assets: 'sensor.energy_asset_index',
    relationships: 'sensor.energy_relationship_index',
    commands: 'sensor.energy_command_index',
    activity: 'sensor.energy_activity_index',
    overviewExperience: 'sensor.energy_overview_experience',
    planningExperience: 'sensor.energy_planning_experience_index',
    outlook: 'sensor.energy_outlook_property_index',
    solar: 'sensor.energy_solar_property_index',
    grid: 'sensor.energy_grid_property_index',
    battery: 'sensor.energy_battery_property_index',
    consumption: 'sensor.energy_consumption_property_index',
    forecast: 'sensor.energy_forecast_property_index',
    pricing: 'sensor.energy_pricing_property_index',
    metering: 'sensor.energy_asset_metering_index',
    consumer: 'sensor.energy_consumer_property_index',
    consumerMix: 'sensor.energy_consumer_mix_index',
    connection: 'sensor.energy_connection_property_index',
    flexibleAssets: 'sensor.energy_flexible_asset_index',
    strategyProfiles: 'sensor.energy_strategy_profile_index',
    strategyEffective: 'sensor.energy_strategy_effective_index',
    planning: 'sensor.energy_planning_index',
    intelligence: 'sensor.energy_intelligence_property_index',
    retrospective: 'sensor.energy_retrospective_event_index',
    value: 'sensor.energy_value_accounting_index',
    editableProperties: 'sensor.energy_public_editable_property_index'
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

// ---- src/runtime/consumption-contract.js ----
// R1.89.39 canonical live consumption contract. Public concepts are exactly:
// Site Consumption, Home Consumption, Flexible Loads and Home Battery.
// Retired pre-R1.89.39 consumption aliases are
// deliberately not read or reconstructed.
  function readLiveConsumptionContract(gateway) {
    const envelope = gateway.contract('consumption');
    const attrs = envelope.attributes || {};
    const rows = [];
    const append = value => {
      const row = objectFrom(value);
      const key = String(firstDefined(row.property_id, row.property_key, row.key, '') || '');
      if (key) rows.push({ ...row, key });
    };
    const byKey = parseMaybeJson(attrs.properties_by_key, attrs.properties_by_key || null);
    if (byKey && typeof byKey === 'object' && !Array.isArray(byKey)) Object.entries(byKey).forEach(([key,value]) => append({ key, ...objectFrom(value) }));
    const properties = parseMaybeJson(attrs.properties, attrs.properties || null);
    if (Array.isArray(properties)) properties.forEach(append);
    const rowFor = key => rows.find(row => String(firstDefined(row.property_id,row.property_key,row.key,'')) === key) || null;
    const canonicalValue = (key, nestedKey) => {
      const row = rowFor(key);
      const nested = objectFrom(parseMaybeJson(attrs[nestedKey], attrs[nestedKey] || null));
      return { row, nested, value:asNumber(firstDefined(row && rowValue(row, null), nested.power_kw)) };
    };
    const breakdownRaw = parseMaybeJson(attrs.demand_export_breakdown_json, attrs.demand_export_breakdown_json || null);
    const breakdownRows = Array.isArray(breakdownRaw) ? breakdownRaw.map(objectFrom) : [];
    const breakdownFor = rowId => breakdownRows.find(row => String(firstDefined(row.row_id,row.asset_id,row.id,'')) === rowId) || null;
    const withBreakdown = (part, rowId) => {
      const breakdown = breakdownFor(rowId);
      return { ...part, breakdown, value:part.value ?? asNumber(firstDefined(breakdown?.power_kw,breakdown?.value)) };
    };
    const site = withBreakdown(canonicalValue('site_consumption.power_kw', 'site_consumption'),'site_consumption');
    const home = withBreakdown(canonicalValue('home_consumption.power_kw', 'home_consumption'),'home_consumption');
    const flexible = withBreakdown(canonicalValue('flexible_loads.power_kw', 'flexible_loads'),'flexible_loads');
    let contributors = parseMaybeJson(firstDefined(flexible.row?.contributors_json, flexible.row?.contributors, flexible.nested.contributors_json, flexible.nested.contributors, attrs.flexible_load_contributors_json), []);
    if (!Array.isArray(contributors) && contributors && typeof contributors === 'object') contributors = Object.values(contributors);
    contributors = (Array.isArray(contributors) ? contributors : []).map(value => objectFrom(value));
    const statusFor = part => String(firstDefined(part.row?.status_label, part.row?.measurement_state, part.row?.availability, part.row?.health, part.breakdown?.status_label, part.breakdown?.measurement_state, part.breakdown?.availability, part.breakdown?.health, part.nested.status_label, part.nested.measurement_state, part.nested.availability, attrs.health, part.value !== null ? 'MEASURED' : 'UNAVAILABLE'));
    const reasonFor = part => String(firstDefined(part.row?.degraded_reason, part.row?.reason, part.row?.health_reason, part.breakdown?.degraded_reason, part.breakdown?.reason, part.breakdown?.health_reason, part.nested.degraded_reason, part.nested.reason, ''));
    return Object.freeze({
      envelope,
      siteConsumptionKw:site.value,
      homeConsumptionKw:home.value,
      flexibleLoadsKw:flexible.value,
      flexibleLoadContributors:Object.freeze(contributors),
      siteStatus:statusFor(site),
      homeStatus:statusFor(home),
      flexibleStatus:statusFor(flexible),
      siteReason:reasonFor(site),
      homeReason:reasonFor(home),
      flexibleReason:reasonFor(flexible),
      available:site.value !== null || home.value !== null || flexible.value !== null
    });
  }

// ---- src/domain/models/current-energy-view-model.js ----
// Canonical current-energy view model. Literal contract keys and direction
// semantics are confined to this adapter so screen renderers cannot drift.
  function readTypedPropertyContract(gateway, interfaceKey, propertyKey) {
    const envelope = gateway.contract(interfaceKey);
    const attrs = envelope.attributes || {};
    const byKey = parseMaybeJson(attrs.properties_by_key, attrs.properties_by_key || null);
    const direct = byKey && typeof byKey === 'object' && !Array.isArray(byKey)
      ? objectFrom(byKey[propertyKey])
      : {};
    const properties = parseMaybeJson(attrs.properties, attrs.properties || null);
    const fromList = Array.isArray(properties)
      ? objectFrom(properties.find(row => String(firstDefined(row?.key,row?.property_key,row?.property_id,'')) === propertyKey))
      : {};
    const row = Object.keys(direct).length ? direct : fromList;
    return Object.freeze({
      envelope,
      row,
      value:firstDefined(rowValue(row, null), row.value, null),
      number:asNumber(firstDefined(rowValue(row, null), row.value)),
      text:String(firstDefined(rowValue(row, null), row.value, '') || ''),
      health:String(firstDefined(row.status_label,row.measurement_state,row.availability,row.health,envelope.available ? 'AVAILABLE' : 'UNAVAILABLE')),
      reason:String(firstDefined(row.degraded_reason,row.reason,row.health_reason,''))
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
    const envelope = gateway.contract('battery');
    const attrs = envelope.attributes || {};
    const signed = readTypedPropertyContract(gateway, 'battery', 'battery.power_kw');
    const charge = readTypedPropertyContract(gateway, 'battery', 'battery.charge_power_kw');
    const discharge = readTypedPropertyContract(gateway, 'battery', 'battery.discharge_power_kw');
    const stateProperty = readTypedPropertyContract(gateway, 'battery', 'battery.state');
    const soc = readTypedPropertyContract(gateway, 'battery', 'battery.soc_pct');
    const available = readTypedPropertyContract(gateway, 'battery', 'battery.available_kwh');
    const capacity = readTypedPropertyContract(gateway, 'battery', 'battery.capacity_kwh');
    const healthProperty = readTypedPropertyContract(gateway, 'battery', 'battery.health');
    const flowProjection = objectFrom(parseMaybeJson(attrs.flow_projection_json, attrs.flow_projection_json || null));
    const state = canonicalBatteryState(firstDefined(stateProperty.value, flowProjection.state, attrs.state));
    const projectedPowerKw = asNumber(firstDefined(flowProjection.power_kw, null));
    let displayPowerKw = null;
    let signedFlowKw = null;
    let direction = 'unknown';
    let label = 'Unavailable';
    let detail = 'Battery flow unavailable';

    if (state === 'charging') {
      displayPowerKw = firstDefined(charge.number, projectedPowerKw, signed.number === null ? null : Math.abs(Math.min(0, signed.number)));
      displayPowerKw = asNumber(displayPowerKw);
      signedFlowKw = displayPowerKw === null ? null : -Math.abs(displayPowerKw);
      direction = 'into_storage';
      label = 'Charging';
      detail = 'Charging from Home Bus';
    } else if (state === 'discharging') {
      displayPowerKw = firstDefined(discharge.number, projectedPowerKw, signed.number === null ? null : Math.max(0, signed.number));
      displayPowerKw = asNumber(displayPowerKw);
      signedFlowKw = displayPowerKw === null ? null : Math.abs(displayPowerKw);
      direction = 'out_of_storage';
      label = 'Discharging';
      detail = 'Supplying the Home Bus';
    } else if (state === 'idle') {
      displayPowerKw = 0;
      signedFlowKw = 0;
      direction = 'idle';
      label = 'Idle';
      detail = 'No active battery flow';
    }

    const health = String(firstDefined(healthProperty.value, healthProperty.health, envelope.available ? 'OK' : 'UNAVAILABLE'));
    return Object.freeze({
      state,
      health,
      reason:String(firstDefined(healthProperty.reason, stateProperty.reason, attrs.health_reason, '')),
      signedPowerKw:signed.number,
      chargePowerKw:charge.number,
      dischargePowerKw:discharge.number,
      displayPowerKw,
      signedFlowKw,
      direction,
      label,
      detail,
      flowRole:String(firstDefined(flowProjection.flow_role, direction === 'out_of_storage' ? 'producer' : direction === 'into_storage' ? 'consumer' : 'inactive')),
      uxVisible:asBool(firstDefined(flowProjection.ux_visible, displayPowerKw !== null), displayPowerKw !== null),
      socPct:soc.number,
      availableKwh:available.number,
      capacityKwh:capacity.number,
      valueAvailable:displayPowerKw !== null
    });
  }

  function createGridCurrentFlowViewModel(gateway) {
    const importPower = readTypedPropertyContract(gateway, 'grid', 'grid_import.power_kw');
    const exportPower = readTypedPropertyContract(gateway, 'grid', 'grid_export.power_kw');
    const directionProperty = readTypedPropertyContract(gateway, 'grid', 'grid.flow_direction');
    const rawDirection = String(firstDefined(directionProperty.value, '') || '').toLowerCase();
    const direction = /export/.test(rawDirection) ? 'exporting' : /import/.test(rawDirection) ? 'importing' : 'balanced';
    const displayPowerKw = direction === 'exporting' ? exportPower.number : direction === 'importing' ? importPower.number : 0;
    return Object.freeze({
      importPowerKw:importPower.number,
      exportPowerKw:exportPower.number,
      displayPowerKw,
      direction,
      label:direction === 'exporting' ? 'Exporting' : direction === 'importing' ? 'Importing' : 'Balanced'
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
// R1.89.39 canonical reader for sensor.energy_command_index. UX visibility and
// enablement are backend-owned. The frontend does not infer readiness from
// command state, physical state, applicability or resolved bindings.
  function readEnergyCommandContract(gateway) {
    const envelope = gateway.contract('commands');
    const attrs = envelope.attributes || {};
    const raw = parseMaybeJson(attrs.commands_json, null) || [];
    const values = Array.isArray(raw) ? raw : [];
    const roleFor = row => String(row.role || '').trim().toLowerCase();
    const rows = values.map((value, index) => {
      const row = objectFrom(value);
      const commandId = String(firstDefined(row.command_id, row.action_id, row.command_key, row.id, '') || '');
      const targetAssetId = String(firstDefined(row.target_asset_id, row.asset_id, row.flexible_asset_id, row.planning_target_asset_id, '') || '');
      const visible = asBool(firstDefined(row.visible, row.ux_visible), false);
      const enabled = visible && asBool(firstDefined(row.enabled, row.ux_enabled), false);
      return Object.freeze({
        command_row_id: row.command_instance_id || row.command_row_id || `command_${index + 1}`,
        entity_id: envelope.entityId,
        ...row,
        command_id: commandId,
        target_asset_id: targetAssetId,
        role: roleFor(row),
        contract_valid: ['start','stop','pause','resume'].includes(roleFor(row)),
        command_owner: String(firstDefined(row.command_owner, row.owner, '') || ''),
        action_kind: String(firstDefined(row.action_kind, row.kind, '') || ''),
        command_resolved: !!row.invoke,
        currently_applicable: enabled,
        visible,
        enabled,
        blocked_reason:String(firstDefined(row.blocked_reason, row.reason?.message, row.reason?.code, '')),
        user_action_text:String(firstDefined(row.user_action_text, ''))
      });
    });
    return Object.freeze({ envelope, rows });
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