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
    core:{contract_id:'RHI_ENERGY_CORE_V2',
      battery:{status:available?'AVAILABLE':'UNAVAILABLE',fields:{
        state:sem(state==='unavailable'?null:state),power_kw:sem(signed,'kW'),soc_pct:sem(38,'%'),available_kwh:sem(11.1,'kWh'),capacity_kwh:sem(29.2,'kWh'),reserve_target_pct:sem(20,'%')
      },contributors:[]},
      grid:{status:'AVAILABLE',fields:{net_power_kw:sem(-0.1,'kW'),import_power_kw:sem(0,'kW'),export_power_kw:sem(0.1,'kW'),flow_direction:sem('exporting')}},
      solar:{status:'AVAILABLE',fields:{power_kw:sem(2.8,'kW')}},
      consumption:{status:'AVAILABLE',fields:{power_kw:sem(2.7,'kW')}},
      home:{status:'AVAILABLE',fields:{power_kw:sem(2.6,'kW')}},
      flexible:{status:'AVAILABLE',producer_available:true,fields:{power_kw:sem(0.1,'kW'),attributed_power_kw:sem(0.1,'kW')},assets:[
        {asset_id:'charger_1',asset_type:'charger',source_asset_kind:'charger',participation_state:'infrastructure_only',infrastructure_only:true,power_kw:0.0},
        {asset_id:'vehicle_1',asset_type:'vehicle',source_asset_kind:'vehicle',participation_state:'participating',power_kw:0.1}
      ]}
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
  if(model.consumption.flexibleLoadContributors.length!==1 || model.consumption.flexibleLoadContributors[0].asset_id!=='vehicle_1') throw new Error('infrastructure leaked into managed contributor identities');
}

function aggregateGateway() {
  const unavailable=(unit=null)=>({value:null,unit,status:'UNAVAILABLE',quality:'UNKNOWN',reason:'core_not_published'});
  const attrs={
    contract_id:'RHI_ENERGY_PUBLIC_CONTRACT_V2',contract_version:'2.0.0',release:'E0.15.87',
    core:{
      battery:{fields:{state:unavailable(),power_kw:unavailable('kW'),soc_pct:unavailable('%'),available_kwh:unavailable('kWh'),capacity_kwh:unavailable('kWh'),reserve_target_pct:unavailable('%')}},
      solar:{fields:{power_kw:unavailable('kW')}},
      grid:{fields:{net_power_kw:unavailable('kW'),import_power_kw:unavailable('kW'),export_power_kw:unavailable('kW'),flow_direction:unavailable()}},
      consumption:{fields:{power_kw:unavailable('kW')}},
      home:{fields:{power_kw:unavailable('kW')}},
      flexible:{fields:{power_kw:unavailable('kW'),attributed_power_kw:unavailable('kW')},assets:[]}
    },
    objects:[
      {asset_id:'battery_system',object_class:'battery_system',power_kw:2.855,soc_pct:51.826,capacity_kwh:29.2,available_kwh:15.1333,operating_state:'discharging',reserve_target_pct:20,properties:[]},
      {asset_id:'solar_production',object_class:'solar_production',power_kw:0.0,properties:[]},
      {asset_id:'grid_connection',object_class:'grid_connection',net_power_kw:1.1,import_power_kw:1.1,export_power_kw:0,flow_direction:'importing',properties:[]},
      {asset_id:'site_consumption',object_class:'site_consumption',power_kw:3.955,properties:[]},
      {asset_id:'home_consumption',object_class:'home_consumption',power_kw:3.955,properties:[]}
    ],
    profiles:[],relationships:[],planning:{horizons:{}},configuration:{},intelligence:{},summary:{}
  };
  return {contract(key){
    if(key!=='publicV2') throw new Error(`unexpected contract read: ${key}`);
    return {entityId:'sensor.rhi_energy_public_contract_v2',state:'OK',available:true,attributes:attrs,contractVersion:'2.0.0'};
  }};
}
const aggregateModel=context.createCurrentEnergyViewModel(aggregateGateway());
if(aggregateModel.battery.displayPowerKw!==2.855) throw new Error('battery aggregate power did not win over unavailable core');
if(aggregateModel.battery.socPct!==51.826 || aggregateModel.battery.capacityKwh!==29.2 || aggregateModel.battery.availableKwh!==15.1333) throw new Error('battery aggregate facts diverged');
if(aggregateModel.battery.label!=='Discharging') throw new Error('battery aggregate state diverged');
if(aggregateModel.solar.powerKw!==0) throw new Error('solar aggregate zero must remain measured zero');
if(aggregateModel.grid.importPowerKw!==1.1 || aggregateModel.grid.direction!=='importing') throw new Error('grid aggregate projection failed');
if(aggregateModel.consumption.siteConsumptionKw!==3.955 || aggregateModel.consumption.homeConsumptionKw!==3.955) throw new Error('consumption aggregate projection failed');
console.log('PASS current Energy model uses one canonical aggregate projection when core fields are unavailable');

console.log('current-energy V2 core view-model matrix PASS');
