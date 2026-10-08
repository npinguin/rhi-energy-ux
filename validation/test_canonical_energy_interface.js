const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.resolve(__dirname, '..');
const context = {
  firstDefined: (...values) => values.find(v => v !== undefined && v !== null),
  parseMaybeJson: (value, fallback = null) => {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value !== 'string') return value;
    try { return JSON.parse(value); } catch { return fallback; }
  },
  console
};
vm.createContext(context);
for (const file of [
  'src/runtime/public-interface-registry.js',
  'src/runtime/energy-contract-gateway.js',
  'src/runtime/energy-v2-contract.js'
]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename:file});
}

const states = {
  'sensor.rhi_energy_public_contract_v2': {
    entity_id:'sensor.rhi_energy_public_contract_v2',
    state:'OK',
    attributes:{
      contract_id:'RHI_ENERGY_PUBLIC_CONTRACT_V2',
      core:{
        battery:{
          fields:{
            soc_pct:{value:12, status:'AVAILABLE', quality:'CANONICAL', unit:'%'}
          }
        }
      },
      objects:[], profiles:[], relationships:[], connections:[],
      planning:{}, metering:{}, retrospective:{}, intelligence:{}, overview:{},
      configuration:{}, value_accounting:{}, layers:{}, summary:{}, experience:{},
      commands:[], activity:[]
    }
  },
  'sensor.energy_battery_system_battery_soc_pct': {
    entity_id:'sensor.energy_battery_system_battery_soc_pct',
    state:'41',
    attributes:{
      canonical_contract:'RHI_ENERGY_CANONICAL_PROPERTY_V2',
      asset_id:'battery_system',
      logical_object_class:'battery_system',
      property_key:'battery.soc_pct',
      display_name:'State of charge',
      value:41,
      availability:'AVAILABLE',
      quality:'DERIVED',
      unit:'%',
      presentation_family:'storage',
      presentation_role:'key',
      presentation_surface:'key_properties',
      presentation_primary:true,
      presentation_technical:false
    }
  },
  'sensor.energy_battery_system_status': {
    entity_id:'sensor.energy_battery_system_status',
    state:'OK',
    attributes:{
      canonical_contract:'RHI_ENERGY_CANONICAL_OBJECT_V2',
      asset_id:'battery_system',
      logical_object_class:'battery_system',
      display_name:'Home Battery',
      health:'OK'
    }
  }
};

const host = {
  hass:{states},
  state:id=>states[id]||null
};
const gateway = context.createEnergyContractGateway(host);
const store = context.readEnergyPublicV2(gateway);

if (gateway.canonicalPropertyRows().length !== 1) throw new Error('canonical property discovery failed');
if (gateway.canonicalObjectRows().length !== 1) throw new Error('canonical object discovery failed');

const soc = store.currentField('battery.soc_pct');
if (!soc.resolved || soc.value !== 41) throw new Error('canonical property did not outrank aggregate Public V2');
if (soc.source !== 'RHI_ENERGY_CANONICAL_PROPERTY_V2') throw new Error('wrong canonical property authority');
if (store.canonicalPropertyRows[0].presentation_family !== 'storage') throw new Error('presentation metadata lost');
if (store.canonicalPropertyRows[0].presentation_role !== 'key') throw new Error('presentation role lost');

console.log('PASS canonical Energy property contract is primary current-truth authority');
