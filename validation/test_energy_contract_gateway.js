// Native Energy HA boundary: no gateway.contract('publicV2') may exist.
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const ctx={Object,Array,Map,Set,String,Number,Boolean,JSON,console,
  firstDefined:(...v)=>v.find(x=>x!==undefined&&x!==null),
  parseMaybeJson:(x,f)=>{try{return typeof x==='string'?JSON.parse(x):x??f;}catch{return f;}},
  asNumber:x=>x==null||x===''||!Number.isFinite(Number(x))?null:Number(x)};
vm.createContext(ctx);
for(const path of ['src/runtime/canonical-property-index.js','src/runtime/energy-contract-gateway.js',
  'src/domain/planning/planning-contract.js'])
  vm.runInContext(fs.readFileSync(path,'utf8'),ctx,{filename:path});
const keys=['required_kwh','planned_kwh','still_to_plan_kwh','flexible_required_kwh',
  'flexible_planned_kwh','flexible_still_to_plan_kwh'];
const totals={D0:[21,18,3,8,5,3],D1:[16,10,6,7,1,6]};
const states={
  'sensor.energy_property':{state:'0',attributes:{
    canonical_contract:'RHI_ENERGY_CANONICAL_PROPERTY_V2',
    asset_id:'battery_system',logical_object_class:'battery_system',
    property_key:'battery.power_kw',value:0,availability:'AVAILABLE',
    presentation_family:'battery',presentation_role:'key',presentation_surface:'overview'
  }},
  'sensor.energy_object':{state:'OK',attributes:{
    canonical_contract:'RHI_ENERGY_CANONICAL_OBJECT_V2',asset_id:'battery_system',
    logical_object_class:'battery_system',availability:'AVAILABLE',
    visual_ref:'energy:battery'
  }}
};
for(const [id,values] of Object.entries(totals))keys.forEach((key,i)=>{
  const metric='planning_'+(id==='D0'?'today':'tomorrow')+'_'+key;
  states['sensor.'+metric]={state:String(values[i]),attributes:{
    canonical_source:'rhi_energy.runtime',metric_key:metric,availability:'AVAILABLE'}
  };
});
const hass={states};
const host={hass,rawState:id=>hass.states[id],
  canonicalIndex:ctx.createEnergyCanonicalPropertyIndex(hass),
  nativePlanningTotals:id=>ctx.readNativeEnergyPlanningTotals(hass,id)};
const gateway=ctx.createEnergyContractGateway(host);
assert.equal(typeof gateway.contract,'undefined','retired aggregate API must not be exported');
assert.equal(gateway.canonicalObject('battery_system').visual_ref,'energy:battery');
assert.equal(gateway.canonicalProperty('battery_system','battery.power_kw').value,0);
assert.equal(gateway.nativeMetric('planning_today_required_kwh').value,'21');
assert.equal(gateway.nativePlanningTotals('D0').available,true);
assert.equal(gateway.nativePlanningTotals('D1').available,true);
const contract=ctx.readPlanningContract(host,'D1');
assert.equal(contract.contractVersion,'ENERGY_NATIVE_PLANNING');
assert.equal(contract.totalsSource,'rhi_energy.runtime/native_metric');
assert.equal(contract.horizon.required_kwh,16);
assert.equal(contract.horizon.planned_kwh,10);
assert.equal(contract.horizon.still_to_plan_kwh,6);
assert.equal(contract.horizon.flexible_still_to_plan_kwh,6);
assert.equal(contract.planningTodayTotals.required_kwh,21);
assert.equal(contract.planningTomorrowTotals.required_kwh,16);
// Missing D1 metrics fail closed while D0 independent evidence remains valid.
delete hass.states['sensor.planning_tomorrow_required_kwh'];
const incomplete=ctx.readNativeEnergyPlanningTotals(hass,'D1');
assert.equal(incomplete.available,false);
assert.equal(incomplete.values.required_kwh.available,false);
assert.equal(ctx.readNativeEnergyPlanningTotals(hass,'D0').available,true);
console.log('PASS native gateway: object identity, 0 kW, publisher-owned D0/D1, and no aggregate fallback');
