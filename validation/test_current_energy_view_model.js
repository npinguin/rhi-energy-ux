const fs = require('fs');
const vm = require('vm');

const v2Source = fs.readFileSync('src/runtime/energy-v2-contract.js', 'utf8');
const source = fs.readFileSync('src/domain/models/current-energy-view-model.js', 'utf8');
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
vm.runInContext(v2Source, context);
vm.runInContext(source, context);

function gatewayFor(state, signed, charge, discharge) {
  const objects = [
    {
      asset_id:'battery_system',
      object_class:'battery_system',
      properties:[
        {property_key:'battery.state',value:state,resolution:{status:state === 'unavailable' ? 'UNAVAILABLE' : 'RESOLVED'}},
        {property_key:'battery.power_kw',value:signed,resolution:{status:signed === null ? 'UNAVAILABLE' : 'RESOLVED'}},
        {property_key:'battery.charge_power_kw',value:charge,resolution:{status:charge === null ? 'UNAVAILABLE' : 'RESOLVED'}},
        {property_key:'battery.discharge_power_kw',value:discharge,resolution:{status:discharge === null ? 'UNAVAILABLE' : 'RESOLVED'}},
        {property_key:'battery.soc_pct',value:38,resolution:{status:'RESOLVED'}},
        {property_key:'battery.available_kwh',value:11.1,resolution:{status:'RESOLVED'}},
        {property_key:'battery.capacity_kwh',value:29.2,resolution:{status:'RESOLVED'}},
        {property_key:'battery.health',value:'OK',resolution:{status:'RESOLVED'}}
      ]
    },
    {
      asset_id:'grid_connection',
      object_class:'grid_connection',
      properties:[
        {property_key:'grid_import.power_kw',value:0,resolution:{status:'RESOLVED'}},
        {property_key:'grid_export.power_kw',value:0.1,resolution:{status:'RESOLVED'}},
        {property_key:'grid.flow_direction',value:'exporting',resolution:{status:'RESOLVED'}}
      ]
    },
    {
      asset_id:'solar_production',
      object_class:'solar_production',
      properties:[{property_key:'solar.power_kw',value:2.8,resolution:{status:'RESOLVED'}}]
    }
  ];
  const attrs = {
    contract_id:'RHI_ENERGY_PUBLIC_CONTRACT_V2',
    contract_version:'2.0.0',
    release:'E0.15.46',
    objects,
    profiles:[],
    relationships:[],
    planning:{},
    intelligence:{},
    summary:{}
  };
  return { contract(key) {
    if (key !== 'publicV2') throw new Error(`unexpected legacy contract read: ${key}`);
    return {entityId:'sensor.rhi_energy_public_contract_v2',state:'OK',available:true,attributes:attrs,contractVersion:'2.0.0'};
  } };
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
