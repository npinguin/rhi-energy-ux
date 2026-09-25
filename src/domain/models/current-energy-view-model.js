// Canonical current-energy view model. Literal contract keys and direction
// semantics are confined to this adapter so screen renderers cannot drift.
  function readTypedPropertyContract(gateway, interfaceKey, propertyKey) {
    // interfaceKey is retained in the signature for call-site stability while the
    // canonical source is now exclusively RHI_ENERGY_PUBLIC_CONTRACT_V2.
    const v2 = readEnergyPublicV2(gateway);
    const row = v2.property(propertyKey);
    const projected = v2.field(propertyKey);
    return Object.freeze({
      envelope:v2.envelope,
      row:row || {},
      value:projected.value,
      number:asNumber(projected.value),
      text:String(projected.value ?? ''),
      health:String(projected.state || 'unavailable').toUpperCase(),
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
    const charge = readTypedPropertyContract(gateway, 'battery', 'battery.charge_power_kw');
    const discharge = readTypedPropertyContract(gateway, 'battery', 'battery.discharge_power_kw');
    const stateProperty = readTypedPropertyContract(gateway, 'battery', 'battery.state');
    const soc = readTypedPropertyContract(gateway, 'battery', 'battery.soc_pct');
    const available = readTypedPropertyContract(gateway, 'battery', 'battery.available_kwh');
    const capacity = readTypedPropertyContract(gateway, 'battery', 'battery.capacity_kwh');
    const healthProperty = readTypedPropertyContract(gateway, 'battery', 'battery.health');
    const state = canonicalBatteryState(stateProperty.value);
    const projectedPowerKw = signed.number === null ? null : Math.abs(signed.number);
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

    const health = String(firstDefined(healthProperty.value, healthProperty.health, signed.value !== null ? 'OK' : 'UNAVAILABLE'));
    return Object.freeze({
      state,
      health,
      reason:String(firstDefined(healthProperty.reason, stateProperty.reason, '')),
      signedPowerKw:signed.number,
      chargePowerKw:charge.number,
      dischargePowerKw:discharge.number,
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
