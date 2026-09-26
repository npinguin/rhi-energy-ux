// Canonical current-energy view model. Literal contract keys and direction
// semantics are confined to this adapter so screen renderers cannot drift.
function readTypedPropertyContract(gateway, interfaceKey, propertyKey) {
  // interfaceKey is retained in the signature for call-site stability while the
  // canonical source is exclusively RHI_ENERGY_PUBLIC_CONTRACT_V2.
  const v2 = readEnergyPublicV2(gateway);
  const row = v2.property(propertyKey);
  const projected = v2.field(propertyKey);
  return Object.freeze({
    envelope:v2.envelope,
    row:row || projected.raw || {},
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
