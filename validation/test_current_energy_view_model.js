// Live current-energy acceptance: exact backend-owned canonical properties only.
// No Public V2, old aggregate, source integration, or semantic fallback fixtures.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const context={
  Object,Array,Map,Set,Math,String,Number,Boolean,JSON,
  firstDefined:(...v)=>v.find(x=>x!==undefined&&x!==null),
  asNumber:v=>v===null||v===undefined||v===''||!Number.isFinite(Number(v))?null:Number(v)
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('src/domain/models/current-energy-view-model.js','utf8')+
  '\nthis.readTypedPropertyContract=readTypedPropertyContract;this.createBatteryCurrentFlowViewModel=createBatteryCurrentFlowViewModel;this.createSolarCurrentViewModel=createSolarCurrentViewModel;',context);
// Load the actual native metric reader used by the consumption adapter; never stub it.
vm.runInContext(fs.readFileSync('src/runtime/canonical-property-index.js','utf8'),context);
vm.runInContext(fs.readFileSync('src/runtime/consumption-contract.js','utf8')+
  '\nthis.readLiveConsumptionContract=readLiveConsumptionContract;',context);
const property=(asset,type,key,value,availability='AVAILABLE')=>({
  asset_id:asset,logical_object_class:type,property_key:key,value,availability,quality:'CANONICAL',entity_id:'sensor.'+asset+'_'+key,reason:''
});
const rows=[
  property('battery_system','battery_system','battery.power_kw',-2.817),
  property('battery_unit_1','battery','battery.power_kw',-1.416),
  property('battery_system','battery_system','battery.soc_pct',8.935),
  property('battery_unit_1','battery','battery.soc_pct',4.44),
  property('solar_production','solar_production','solar.power_kw',3.7159),
  property('solar_inverter_1','solar_inverter','solar.power_kw',3.7159),
  property('solar_inverter_2','solar_inverter','solar.power_kw',0),
  property('grid_connection','grid_connection','grid.net_power_kw',-0.021),
  property('home_consumption','home_consumption','home_consumption.power_kw',0.878)
];
const nativeStates={
  'sensor.site_consumption_metric':{state:'1.865',attributes:{
    metric_key:'site_consumption_power_kw',canonical_source:'rhi_energy.runtime',
    availability:'AVAILABLE',unit_of_measurement:'kW'
  }},
  'sensor.flexible_loads_metric':{state:'0',attributes:{
    metric_key:'flexible_loads_power_kw',canonical_source:'rhi_energy.runtime',
    availability:'AVAILABLE',unit_of_measurement:'kW'
  }},
  'sensor.home_consumption_metric':{state:'0.878',attributes:{
    metric_key:'home_consumption_power_kw',canonical_source:'rhi_energy.runtime',
    availability:'AVAILABLE',quality:'CANONICAL',unit_of_measurement:'kW'
  }}
};
const fromRows=(dataset,states=nativeStates)=>({host:{
  hass:{states},
  canonicalIndex:{rowsForProperty:key=>dataset.filter(row=>row.property_key===key)}
},contract(){throw new Error('legacy aggregate accessed by live current model')}});
const gateway=fromRows(rows);
const read=(key)=>context.readTypedPropertyContract(gateway,'',key);
assert.equal(read('battery.power_kw').number,-2.817);
assert.equal(read('battery.soc_pct').number,8.935);
assert.equal(read('solar.power_kw').number,3.7159);
assert.equal(read('grid.net_power_kw').number,-0.021);
assert.equal(read('home_consumption.power_kw').number,0.878);
const consumption=context.readLiveConsumptionContract(gateway);
assert.equal(consumption.homeConsumptionKw,0.878);
assert.equal(consumption.siteConsumptionKw,1.865);
assert.equal(consumption.source,'RHI_ENERGY_CANONICAL_PROPERTY_V2');
assert.equal(consumption.flexibleLoadsKw,0);
// The native metric, not a similarly named aggregate/property, is Home consumption truth.
// An imaginary logical object of class site_consumption is not a source.
const directCanonicalSite=fromRows([...rows,property('site','site_consumption','site_consumption.power_kw',99)],{});
assert.equal(context.readLiveConsumptionContract(directCanonicalSite).siteConsumptionKw,null);
const onlyCanonicalHome=fromRows(rows,{});
assert.equal(context.readLiveConsumptionContract(onlyCanonicalHome).homeConsumptionKw,null);
const numericZero={...nativeStates,'sensor.home_consumption_metric':{
  ...nativeStates['sensor.home_consumption_metric'],state:'0'
}};
assert.equal(context.readLiveConsumptionContract(fromRows(rows,numericZero)).homeConsumptionKw,0);
const duplicatedNative={...nativeStates,
  'sensor.home_consumption_duplicate':nativeStates['sensor.home_consumption_metric']};
assert.equal(context.readLiveConsumptionContract(fromRows(rows,duplicatedNative)).homeConsumptionKw,null);

assert.equal(read('battery.capacity_kwh').value,null);
assert.equal(read('battery.capacity_kwh').reason,'canonical_property_not_available');
const duplicate=fromRows([...rows,property('battery_system_copy','battery_system','battery.power_kw',999)]);
assert.equal(context.readTypedPropertyContract(duplicate,'','battery.power_kw').value,null);
assert.equal(context.readTypedPropertyContract(duplicate,'','battery.power_kw').reason,'ambiguous_canonical_property');
assert.equal(context.readTypedPropertyContract(fromRows([]),'','solar.power_kw').value,null);
console.log('PASS native Energy current values and exact object scope; no aggregate fallback');

const siteDuplicate={...nativeStates,'sensor.duplicate_site':nativeStates['sensor.site_consumption_metric']};
assert.equal(context.readLiveConsumptionContract(fromRows(rows,siteDuplicate)).siteConsumptionKw,null,'duplicate site metric cannot win');
console.log('PASS target HA site 1.865 kW, physical flex 0, zero vs missing and native authority');
