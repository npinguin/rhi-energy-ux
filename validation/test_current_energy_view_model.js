const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('source/modules/runtime/current-energy-view-model.js', 'utf8');
const context = {
  console,
  Object,
  Array,
  Math,
  String,
  Number,
  Boolean,
  JSON,
  firstDefined: (...values) => values.find(v => v !== undefined && v !== null),
  parseMaybeJson: (value, fallback = null) => {
    if (value === null || value === undefined || value === '') return fallback;
    if (typeof value === 'string') { try { return JSON.parse(value); } catch (_) { return fallback; } }
    return value;
  },
  objectFrom: value => value && typeof value === 'object' && !Array.isArray(value) ? value : {},
  rowValue: (row, fallback = null) => row && row.value !== undefined ? row.value : fallback,
  asNumber: value => value === null || value === undefined || value === '' || Number.isNaN(Number(value)) ? null : Number(value),
  asBool: (value, fallback = false) => value === undefined || value === null ? fallback : value === true || value === 'true' || value === 1,
  readLiveConsumptionContract: () => Object.freeze({siteConsumptionKw:2.7,homeConsumptionKw:2.6,flexibleLoadsKw:0.0})
};
vm.createContext(context);
vm.runInContext(source, context);

function gatewayFor(state, signed, charge, discharge) {
  const contracts = {
    battery: {
      state:'ready',
      contract_visibility:'ux_safe',
      properties_by_key: {
        'battery.state': {value:state, health:'OK'},
        'battery.power_kw': {value:signed, health:'OK'},
        'battery.charge_power_kw': {value:charge, health:'OK'},
        'battery.discharge_power_kw': {value:discharge, health:'OK'},
        'battery.soc_pct': {value:38, health:'OK'},
        'battery.available_kwh': {value:11.1, health:'OK'},
        'battery.capacity_kwh': {value:29.2, health:'OK'},
        'battery.health': {value:'OK', health:'OK'}
      }
    },
    grid: {properties_by_key:{'grid_import.power_kw':{value:0},'grid_export.power_kw':{value:0.1},'grid.flow_direction':{value:'exporting'}}},
    solar: {properties_by_key:{'solar.power_kw':{value:2.8}}},
    consumption: {}
  };
  return { contract(key) { return {entityId:key,state:'ready',available:true,attributes:contracts[key] || {}}; } };
}

const cases = [
  ['charging', -0.1, 0.1, 0.0, 0.1, -0.1, 'Charging', 'into_storage'],
  ['discharging', 0.2, 0.0, 0.2, 0.2, 0.2, 'Discharging', 'out_of_storage'],
  ['idle', 0.0, 0.0, 0.0, 0.0, 0.0, 'Idle', 'idle'],
  ['unavailable', null, null, null, null, null, 'Unavailable', 'unknown']
];
for (const [state,signed,charge,discharge,display,signedFlow,label,direction] of cases) {
  const model = context.createCurrentEnergyViewModel(gatewayFor(state,signed,charge,discharge));
  const got = model.battery;
  if (got.displayPowerKw !== display || got.signedFlowKw !== signedFlow || got.label !== label || got.direction !== direction) {
    throw new Error(`${state} mismatch: ${JSON.stringify(got)}`);
  }
}
console.log('current-energy view-model matrix PASS');
