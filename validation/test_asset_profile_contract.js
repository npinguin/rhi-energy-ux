const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const context={
  Object,Array,Map,Set,String,Number,Boolean,JSON,Math,
  firstDefined:(...values)=>values.find(value=>value!==undefined&&value!==null)
};
vm.createContext(context);
// Construct the real canonical index. A byEntity-only fixture bypasses the
// productRows/ambiguity boundary and is not representative of the runtime.
vm.runInContext(fs.readFileSync('src/runtime/canonical-property-index.js','utf8')+
  '\nthis.createEnergyCanonicalPropertyIndex=createEnergyCanonicalPropertyIndex;',context);
vm.runInContext(fs.readFileSync('src/runtime/asset-profile-contract.js','utf8')+
  '\nthis.readEnergyAssetContext=readEnergyAssetContext;this.energyAssetPublicationGap=energyAssetPublicationGap;',context);
vm.runInContext(fs.readFileSync('src/domain/models/flexible-asset-model.js','utf8')+
  '\nthis.FlexibleAssetDomainModel=FlexibleAssetDomainModel;',context);
const canonical=(asset_id,logical_object_class,property_key,value)=>({
  state:String(value),attributes:{
    canonical_contract:'RHI_ENERGY_CANONICAL_PROPERTY_V2',
    asset_id,logical_object_class,property_key,value,availability:'AVAILABLE',
    asset_display_name:asset_id,quality:'CANONICAL',
    presentation_family:'assets',presentation_role:'summary',
    presentation_surface:'assets',presentation_primary:true
  }
});
const states={
  'sensor.vehicle_mode':canonical('vehicle_test','flexible_load','flexible_load.mode','waiting'),
  'sensor.battery_power':canonical('battery_test','battery','battery.power_kw',0)
};
const hass={states};
const gateway={host:{hass,canonicalIndex:context.createEnergyCanonicalPropertyIndex(hass)},
  contract(){throw Error('Public V2 fallback forbidden')}};
const vehicleContext=context.readEnergyAssetContext(gateway,'vehicle_test');
assert.equal(vehicleContext.available,true);
assert.equal(vehicleContext.asset.asset_type,'flexible_load');
assert.equal(vehicleContext.profile,null);
assert.equal(context.energyAssetPublicationGap(gateway,'vehicle_test').status,'not_published');
assert.equal(context.readEnergyAssetContext(gateway,'unknown').available,false);
const conflicting={states:{...states,
  'sensor.vehicle_mode_duplicate':canonical('vehicle_test','flexible_load','flexible_load.mode','busy')}};
assert.equal(context.readEnergyAssetContext({host:{
  hass:conflicting,canonicalIndex:context.createEnergyCanonicalPropertyIndex(conflicting)
}},'vehicle_test').available,false,'duplicate property publisher cannot form asset truth');
const runtime={
  contractGateway(){return gateway;},
  planningOutcomeFor(){return null;},
  planningIndexRows(){return [];},
  primaryFlexibleAssets(){return [
    {asset_id:'vehicle_test',asset_type:'flexible_load',participation_state:'participating',operating_state:'waiting',profile_id:'backend_profile_vehicle'},
    {asset_id:'battery_test',asset_type:'battery',operating_state:'idle'}
  ];},
  connectedRelationships(){return [];},
  number(){return null;},
  value(_key,fallback){return fallback;}
};
const model=new context.FlexibleAssetDomainModel(runtime);
const vehicle=model.byId('vehicle_test'),battery=model.byId('battery_test');
assert.equal(vehicle.isStorage,false);
assert.equal(vehicle.participation,'participating');
assert.equal(vehicle.operation,'waiting');
assert.equal(vehicle.profileId,'backend_profile_vehicle');
assert.equal(battery.isStorage,true);
assert.equal(battery.operation,'idle');
const text=fs.readFileSync('src/runtime/asset-profile-contract.js','utf8');
assert.equal(text.includes('readEnergyPublicV2('),false);
assert.equal(text.includes('v1_fallback_allowed'),false);
console.log('PASS native Energy asset/profile context, explicit source state and no fallback');
