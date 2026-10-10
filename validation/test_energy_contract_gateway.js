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
      core:{contract_id:'RHI_ENERGY_CORE_V2',},
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
const nativeMetric=(key,value)=>({available:true,value:String(value),metric_key:key});
const keys=['required_kwh','planned_kwh','still_to_plan_kwh','flexible_required_kwh','flexible_planned_kwh','flexible_still_to_plan_kwh'];
const values={D0:[21,18,3,8,5,3],D1:[16,10,6,7,1,6]};
const runtime={
  nativePlanningTotals(horizon){
    return {available:true,horizon,missing:[],values:Object.fromEntries(keys.map((key,i)=>[key,nativeMetric(key,values[horizon][i])]))};
  }
};
const contract=context.readPlanningContract(runtime,'D1');
if(contract.contractVersion!=='ENERGY_NATIVE_PLANNING') throw new Error('native planning contract missing');
if(contract.totalsSource!=='rhi_energy.runtime/native_metric') throw new Error('wrong native totals owner');
if(contract.horizon.required_kwh!==16 || contract.horizon.planned_kwh!==10) throw new Error('native D1 totals lost');
if(contract.horizon.still_to_plan_kwh!==6 || contract.horizon.flexible_still_to_plan_kwh!==6) throw new Error('native planning gap lost');
if(contract.planningTodayTotals.required_kwh!==21 || contract.planningTomorrowTotals.required_kwh!==16) throw new Error('native D0/D1 totals lost');
if(gateway.contract('publicV2').entityId!=='sensor.rhi_energy_public_contract_v2') throw new Error('existing gateway regression');
console.log('PASS Energy native planning contract and existing gateway regression');
