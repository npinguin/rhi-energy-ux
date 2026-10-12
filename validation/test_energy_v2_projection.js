// End-to-end native Energy product projection. Every datum is published on
// its own canonical HA object/property/metric entity; retired snapshots are absent.
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const ctx={Object,Array,Map,Set,String,Number,Boolean,JSON,console};
vm.createContext(ctx);
for(const path of [
  'src/runtime/canonical-property-index.js',
  'src/runtime/command-contract.js',
  'src/runtime/energy-v2-contract.js',
  'src/domain/selectors/energy-selectors.js'
])vm.runInContext(fs.readFileSync(path,'utf8'),ctx,{filename:path});
const object=(asset,cls,metadata={})=>({state:'OK',attributes:{
  canonical_contract:'RHI_ENERGY_CANONICAL_OBJECT_V2',asset_id:asset,
  logical_object_class:cls,display_name:asset,availability:'AVAILABLE',...metadata
}});
const property=(asset,cls,key,value,metadata={})=>({
  state:value===null?'unavailable':String(value),
  attributes:{canonical_contract:'RHI_ENERGY_CANONICAL_PROPERTY_V2',
    asset_id:asset,logical_object_class:cls,property_key:key,value,
    availability:value===null?'UNAVAILABLE':'AVAILABLE',quality:'CANONICAL',
    presentation_family:cls,presentation_role:'key',presentation_surface:'overview',
    ...metadata}
});
const native=(key,value,extra={})=>({state:value===null?'unavailable':String(value),
  attributes:{canonical_source:'rhi_energy.runtime',metric_key:key,
    availability:value===null?'UNAVAILABLE':'AVAILABLE',...extra}});
const states={
  'sensor.battery_system':object('battery_system','battery_system',{
    visual_ref:'energy:battery',children:['battery_a','battery_b'],profile_id:'battery.default'}),
  'sensor.battery_a':object('battery_a','battery',{parent_asset_id:'battery_system'}),
  'sensor.battery_b':object('battery_b','battery',{parent_asset_id:'battery_system'}),
  'sensor.battery_master_soc':property('battery_system','battery_system','battery.soc_pct',72),
  'sensor.battery_master_power':property('battery_system','battery_system','battery.power_kw',-1.2),
  'sensor.battery_a_soc':property('battery_a','battery','battery.soc_pct',81),
  'sensor.battery_a_power':property('battery_a','battery','battery.power_kw',-1.1),
  'sensor.battery_b_soc':property('battery_b','battery','battery.soc_pct',43),
  'sensor.battery_b_power':property('battery_b','battery','battery.power_kw',0.7),
  'sensor.site':object('site_consumption','site_consumption'),
  'sensor.site_kw':property('site_consumption','site_consumption','site_consumption.power_kw',2.6),
  'sensor.home':object('home_consumption','home_consumption'),
  'sensor.home_kw':property('home_consumption','home_consumption','home_consumption.power_kw',1.8),
  'sensor.solar':object('solar_production','solar_production'),
  'sensor.solar_kw':property('solar_production','solar_production','solar.power_kw',3.4),
  'number.reserve':property('configuration:battery','energy_configuration',
    'battery.reserve_target_pct',20,{editable:true,write_supported:true,
      presentation_family:'strategy',presentation_surface:'configuration',
      editor:'number',constraints:{min:5,max:80},
      write:{supported:true,service:'rhi_energy.write_property',
        data:{property_id:'battery.reserve_target_pct'}}}),
  'sensor.financial':native('net_financial_result_eur',1.23,{period:'today',actual_complete:true}),
  'sensor.home_native':native('home_consumption_power_kw',1.8),
  'sensor.site_native':native('site_consumption_power_kw',2.6),
  'sensor.flexible_native':native('flexible_loads_power_kw',0),
  'sensor.energy_retrospective':{state:'WAITING_FOR_EVIDENCE',attributes:{
    canonical_contract:'ENERGY_CANONICAL_RETROSPECTIVE_V1',canonical_source:'rhi_energy.runtime',
    publisher:'rhi_energy',availability:'UNAVAILABLE',
    reason:'planning_execution_metering_incomplete',
    prerequisites:[{id:'planning_outcome',state:'PENDING'}],
    score:null,confidence:null
  }}
};
// Persisted interval evidence must be passed through by exact period identity.
states['sensor.energy_metering_today']={state:'OK',attributes:{
  contract_id:'RHI_ENERGY_METERING_PERIOD_V1',canonical_source:'rhi_energy.runtime',
  publisher:'rhi_energy',period_id:'today',availability:'AVAILABLE',quality:'OK',
  summary:{measured:{solar_production_kwh:0,home_consumption_kwh:2.5},
    quality:{period:'OK',field_quality:{solar_kwh:'OK'}},
    cost:{import_cost_eur:1.5}},
  flexible_assets_kwh:{vehicle_a:1.2},
  field_quality:{solar_kwh:'OK'},field_coverage_seconds:{solar_kwh:3600},
  can_be_used_for_remaining:true
}};
states['sensor.energy_metering_week']={state:'PARTIAL',attributes:{
  contract_id:'RHI_ENERGY_METERING_PERIOD_V1',canonical_source:'rhi_energy.runtime',
  publisher:'rhi_energy',period_id:'week',availability:'AVAILABLE',quality:'PARTIAL',
  summary:{measured:{grid_import_kwh:11},quality:{period:'PARTIAL'},cost:{}}
}};
const totals=['required_kwh','planned_kwh','still_to_plan_kwh',
  'flexible_required_kwh','flexible_planned_kwh','flexible_still_to_plan_kwh'];
for(const [day,values] of [['today',[19.2,19.2,0,8,5,3]],['tomorrow',[11,4,7,7,1,6]]])
  totals.forEach((k,i)=>states['sensor.'+day+'_'+k]=native('planning_'+day+'_'+k,values[i]));
const hass={states};
const host={hass,canonicalIndex:ctx.createEnergyCanonicalPropertyIndex(hass)};
const view=ctx.readEnergyCanonicalProduct({host});
assert.equal(view.available,true);
assert.equal(view.contractVersion,'ENERGY_CANONICAL_NATIVE_V2');
assert.equal(view.object('battery_system').profile_id,'battery.default');
assert.equal(view.object('battery_system').visual_ref,'energy:battery');
assert.equal(view.object('battery_a').parent_asset_id,'battery_system');
assert.equal(view.field('battery.soc_pct','battery_a').value,81);
assert.equal(view.field('battery.soc_pct','battery_b').value,43);
assert.equal(view.field('battery.power_kw','battery_b').value,0.7);
// A globally ambiguous battery.soc_pct must not silently select one asset.
assert.equal(view.field('battery.soc_pct').resolved,false);
assert.equal(view.field('battery.soc_pct').value,null);
assert.equal(view.field('site_consumption.power_kw','site_consumption').value,2.6);
assert.equal(view.field('battery.reserve_target_pct','configuration:battery').editable,true);
assert.equal(view.configuration.strategy.profiles.length,1);
assert.equal(view.configuration.strategy.profiles[0].profile_id,'battery');
assert.equal(view.valueAccounting.periods.today.net_financial_result_eur,1.23);
assert.equal(view.metering.periods.today.summary.measured.solar_production_kwh,0);
assert.equal(view.metering.periods.today.summary.measured.home_consumption_kwh,2.5);
assert.equal(view.metering.periods.today.flexible_assets_kwh.vehicle_a,1.2);
assert.equal(view.metering.periods.week.quality,'PARTIAL');
assert.equal(view.metering.periods.week.can_be_used_for_remaining,false);
assert.equal(view.metering.periods.month,undefined);
assert.equal(view.retrospective.status,'WAITING_FOR_EVIDENCE');
assert.equal(view.retrospective.prerequisites.length,1);
assert.equal(ctx.readEnergyCanonicalProduct({host:{hass:{states:{
 'sensor.s1':states['sensor.energy_retrospective'],'sensor.s2':states['sensor.energy_retrospective']
}},canonicalIndex:ctx.createEnergyCanonicalPropertyIndex({states:{}})}}).retrospective.status,undefined,
 'duplicate native retrospective must fail closed');
assert.equal(ctx.selectEnergyValue(view,'month').net_financial_result_eur,null);
assert.equal(view.planning.horizons.D0.required_kwh,19.2);
assert.equal(view.planning.horizons.D1.still_to_plan_kwh,7);
assert.equal(ctx.selectEnergyOverview(view).available,true);
assert.equal(ctx.selectEnergyAsset(view,'battery_system').identity.visual_ref,'energy:battery');
assert.equal(ctx.selectEnergyConfigurationProperties(view,'strategy').properties.length,1);
// Duplicate publisher for the same asset/property cannot win based on iteration order.
const ambiguous={states:{...states,'sensor.battery_a_duplicate':states['sensor.battery_a_soc']}};
const duplicate=ctx.readEnergyCanonicalProduct({host:{
  hass:ambiguous,canonicalIndex:ctx.createEnergyCanonicalPropertyIndex(ambiguous)
}});
assert.equal(duplicate.field('battery.soc_pct','battery_a').resolved,false);
assert.equal(duplicate.field('battery.soc_pct','battery_a').value,null);
assert.equal(ctx.readEnergyCanonicalProduct({host:{hass:{states:{}},
  canonicalIndex:ctx.createEnergyCanonicalPropertyIndex({states:{}})}}).available,false);
const duplicatedPeriod={states:{...states,
 'sensor.energy_metering_today_duplicate':states['sensor.energy_metering_today']}};
const duplicatedView=ctx.readEnergyCanonicalProduct({host:{
 hass:duplicatedPeriod,canonicalIndex:ctx.createEnergyCanonicalPropertyIndex(duplicatedPeriod)
}});
assert.equal(duplicatedView.metering.periods.today,undefined,'duplicate period evidence must fail closed');
console.log('PASS native Energy metering periods, zero, partial, attribution, duplicates and canonical projections');
