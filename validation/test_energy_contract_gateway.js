const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.resolve(__dirname, '..');
const files = [
  'src/runtime/public-interface-registry.js',
  'src/runtime/energy-contract-gateway.js',
  'src/runtime/energy-v2-contract.js',
  'src/domain/planning/planning-contract.js'
];
const context = {
  RELEASE_ENTITY: 'sensor.energy_release_contract',
  firstDefined: (...values) => values.find(v => v !== undefined && v !== null),
  parseMaybeJson: (value, fallback = null) => {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value !== 'string') return value;
    try { return JSON.parse(value); } catch { return fallback; }
  },
  asNumber: value => value === undefined || value === null || value === '' || !Number.isFinite(Number(value)) ? null : Number(value),
  console
};
vm.createContext(context);
for (const file of files) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename:file});
const states = {
  'sensor.rhi_energy_public_contract_v2': {
    state: 'OK',
    attributes: {
      contract_id:'RHI_ENERGY_PUBLIC_CONTRACT_V2',
      contract_version:'2.0.0',
      release:'E0.15.47',
      objects:[],
      profiles:[],
      relationships:[],
      configuration:{},
      intelligence:{},
      overview:{},
      commands:[],
      activity:[],
      value_accounting:{},
      layers:{planning_objects:[]},
      planning:{
        planning_horizons:{
          D1:{
            summary:{lane_totals:{
              sources:{solar_kwh:63.7,grid_in_kwh:0},
              consumers:{home_kwh:17,managed_energy_kwh:44,flexible_assets:[{asset_id:'vehicle_carole',energy_kwh:36.4}]},
              boundary:{grid_out_kwh:31.368}
            }},
            buckets:[]
          }
        }
      }
    }
  }
};
const host = { state: id => states[id] || null };
const gateway = context.createEnergyContractGateway(host);
const contract = context.readPlanningContract(gateway, 'D1');
const totals = context.normalizePlanningLaneTotals(contract.laneTotals);
if (contract.entityId !== 'sensor.rhi_energy_public_contract_v2') throw new Error('wrong V2 owner');
if (contract.totalsSource !== 'RHI_ENERGY_PUBLIC_CONTRACT_V2.planning.planning_horizons.summary.lane_totals') throw new Error('wrong totals source');
if (totals.solarKwh !== 63.7 || totals.gridOutKwh !== 31.368) throw new Error('canonical totals lost');
if (totals.gridInKwh !== 0) throw new Error('known zero lost');
if (totals.flexibleAssetsById.vehicle_carole.energy_kwh !== 36.4) throw new Error('asset total lost');
console.log('PASS Energy V2 gateway and planning contract');
