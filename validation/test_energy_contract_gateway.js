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
    state:'OK',
    attributes:{
      contract_id:'RHI_ENERGY_PUBLIC_CONTRACT_V2',
      contract_version:'2.0.0',
      release:'E0.15.52',
      core:{},
      objects:[], profiles:[], relationships:[],
      configuration:{}, intelligence:{}, overview:{}, commands:[], activity:[],
      value_accounting:{}, layers:{planning_objects:[]},
      planning:{
        plan_id:'plan-1',
        health:'OK',
        horizons:{
          D0:{
            required_kwh:21.0,
            planned_kwh:18.0,
            executed_kwh:null,
            still_to_plan_kwh:3.0,
            flexible_required_kwh:8.0,
            flexible_planned_kwh:5.0,
            flexible_executed_kwh:null,
            flexible_still_to_plan_kwh:3.0,
            status:'AVAILABLE',
            execution_status:'NOT_MEASURED'
          },
          D1:{
            required_kwh:16.0,
            planned_kwh:10.0,
            still_to_plan_kwh:6.0,
            flexible_required_kwh:7.0,
            flexible_planned_kwh:1.0,
            flexible_still_to_plan_kwh:6.0,
            status:'AVAILABLE'
          }
        }
      }
    }
  }
};

const host={state:id=>states[id]||null};
const gateway=context.createEnergyContractGateway(host);
const contract=context.readPlanningContract(gateway,'D1');
if(contract.entityId!=='sensor.rhi_energy_public_contract_v2') throw new Error('wrong V2 owner');
if(contract.totalsSource!=='RHI_ENERGY_PUBLIC_CONTRACT_V2.planning.horizons') throw new Error('wrong totals source');
if(contract.horizon.required_kwh!==16.0 || contract.horizon.planned_kwh!==10.0) throw new Error('canonical D1 totals lost');
if(contract.horizon.still_to_plan_kwh!==6.0 || contract.horizon.flexible_still_to_plan_kwh!==6.0) throw new Error('canonical planning gap lost');
if(contract.planningTodayTotals.required_kwh!==21.0 || contract.planningTomorrowTotals.required_kwh!==16.0) throw new Error('D0/D1 totals lost');
console.log('PASS Energy V2 gateway and planning horizons contract');
