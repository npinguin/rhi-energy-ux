const fs = require('fs');
const vm = require('vm');

const v2Source = fs.readFileSync('src/runtime/energy-v2-contract.js', 'utf8');
const consumptionSource = fs.readFileSync('src/runtime/consumption-contract.js', 'utf8');
const source = fs.readFileSync('src/domain/models/current-energy-view-model.js', 'utf8');
const context = {
  console, Object, Array, Map, Set, Math, String, Number, Boolean, JSON,
  firstDefined: (...values) => values.find(v => v !== undefined && v !== null),
  parseMaybeJson: (value, fallback = null) => {
    if (value === null || value === undefined || value === '') return fallback;
    if (typeof value === 'string') { try { return JSON.parse(value); } catch (_) { return fallback; } }
    return value;
  },
  asNumber: value => value === null || value === undefined || value === '' || Number.isNaN(Number(value)) ? null : Number(value)
};
vm.createContext(context);
vm.runInContext(v2Source, context);
vm.runInContext(consumptionSource, context);
vm.runInContext(source, context);

function gatewayFor(state, signed) {
  const available=state!=='unavailable' && signed!==null;
  const sem=(value,unit=null)=>({value,unit,status:value===null?'UNAVAILABLE':'AVAILABLE',quality:value===null?'UNKNOWN':'CANONICAL',reason:value===null?'not_available':null});
  const attrs={
    contract_id:'RHI_ENERGY_PUBLIC_CONTRACT_V2',contract_version:'2.0.0',release:'E0.15.52',
    core:{contract_id:'RHI_ENERGY_CORE_V1',
      battery:{status:available?'AVAILABLE':'UNAVAILABLE',fields:{
        state:sem(state==='unavailable'?null:state),power_kw:sem(signed,'kW'),soc_pct:sem(38,'%'),available_kwh:sem(11.1,'kWh'),capacity_kwh:sem(29.2,'kWh'),reserve_target_pct:sem(20,'%')
      },contributors:[]},
      grid:{status:'AVAILABLE',fields:{net_power_kw:sem(-0.1,'kW'),import_power_kw:sem(0,'kW'),export_power_kw:sem(0.1,'kW'),flow_direction:sem('exporting')}},
      solar:{status:'AVAILABLE',fields:{power_kw:sem(2.8,'kW')}},
      consumption:{status:'AVAILABLE',fields:{power_kw:sem(2.7,'kW')}},
      home:{status:'AVAILABLE',fields:{power_kw:sem(2.6,'kW')}},
      flexible:{status:'AVAILABLE',producer_available:true,fields:{power_kw:sem(0.1,'kW'),attributed_power_kw:sem(0.1,'kW')},assets:[]}
    },
    objects:[],profiles:[],relationships:[],planning:{horizons:{}},configuration:{},intelligence:{},summary:{}
  };
  return {contract(key){
    if(key!=='publicV2') throw new Error(`unexpected legacy contract read: ${key}`);
    return {entityId:'sensor.rhi_energy_public_contract_v2',state:'OK',available:true,attributes:attrs,contractVersion:'2.0.0'};
  }};
}

const cases=[
  ['charging',-0.1,0.1,-0.1,'Charging','into_storage'],
  ['discharging',0.2,0.2,0.2,'Discharging','out_of_storage'],
  ['idle',0.0,0.0,0.0,'Idle','idle'],
  ['unavailable',null,null,null,'Unavailable','unknown']
];
for(const [state,signed,display,signedFlow,label,direction] of cases){
  const model=context.createCurrentEnergyViewModel(gatewayFor(state,signed));
  const got=model.battery;
  if(got.displayPowerKw!==display || got.signedFlowKw!==signedFlow || got.label!==label || got.direction!==direction){
    throw new Error(`${state} mismatch: ${JSON.stringify(got)}`);
  }
  if(model.consumption.siteConsumptionKw!==2.7 || model.consumption.homeConsumptionKw!==2.6) throw new Error('core consumption projection failed');
}
console.log('current-energy V2 core view-model matrix PASS');

const unknownGateway={contract(key){
  if(key!=='publicV2') throw new Error('legacy contract access:'+key);
  const sem=value=>({value,status:value===null?'UNAVAILABLE':'AVAILABLE',quality:value===null?'UNKNOWN':'CANONICAL'});
  return {entityId:'sensor.rhi_energy_public_contract_v2',state:'OK',available:true,attributes:{
    contract_id:'RHI_ENERGY_PUBLIC_CONTRACT_V2',contract_version:'2.0.0',release:'E0.15.53',
    core:{contract_id:'RHI_ENERGY_CORE_V1',
      battery:{fields:{state:sem(null),power_kw:sem(null),soc_pct:sem(null),available_kwh:sem(null),capacity_kwh:sem(null),reserve_target_pct:sem(null)}},
      grid:{fields:{net_power_kw:sem(null),import_power_kw:sem(null),export_power_kw:sem(null),flow_direction:sem(null)}},
      solar:{fields:{power_kw:sem(null)}},
      consumption:{fields:{power_kw:sem(null)}},
      home:{fields:{power_kw:sem(null)}},
      flexible:{fields:{power_kw:sem(null),attributed_power_kw:sem(null)},assets:[]}
    }
  },contractVersion:'2.0.0'};
}};
const unknown=context.createCurrentEnergyViewModel(unknownGateway);
if(unknown.grid.direction!=='unknown' || unknown.grid.displayPowerKw!==null) throw new Error('unknown grid must never become balanced/zero');
if(unknown.solar.powerKw!==null) throw new Error('unknown solar must remain unavailable, never zero');
console.log('PASS unknown current-energy truth remains unknown');
