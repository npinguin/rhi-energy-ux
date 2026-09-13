// BEGIN GENERATED MODULE: runtime/current-energy-view-model.js
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
// END GENERATED MODULE: runtime/current-energy-view-model.js
