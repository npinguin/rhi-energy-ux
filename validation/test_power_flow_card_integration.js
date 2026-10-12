const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const adapter=fs.readFileSync('src/runtime/power-flow-card-adapter.js','utf8');
const app=fs.readFileSync('src/app/energy-card.js','utf8');
const env={};vm.createContext(env);vm.runInContext(adapter,env);
const good=(key,logical_object_class,entity_id)=>({property_key:key,logical_object_class,entity_id,availability:'AVAILABLE',unit:'kW',value:0});
const data=[
good('grid_import.power_kw','grid_connection','sensor.grid_import'),
good('grid_export.power_kw','grid_connection','sensor.grid_export'),
good('solar.power_kw','solar_production','sensor.solar_power'),
good('battery.power_kw','battery_system','sensor.battery_power')];
const nativeSite={available:true,entity_id:'sensor.energy_site_consumption_power_kw',value:'5.204',unit:'kW'};
const runtime=(rows,site=nativeSite)=>({
  canonicalIndex:{rowsForProperty:key=>rows.filter(r=>r.property_key===key)},
  nativeMetric:key=>key==='site_consumption_power_kw' ? site : {available:false}
});
const config=env.buildRhiPowerFlowCardConfig(runtime(data));
assert.ok(config,'known real sensors must configure a card');
assert.equal(config.type,'custom:power-flow-card-plus');
assert.equal(config.entities.grid.entity.consumption,'sensor.grid_import');
assert.equal(config.entities.grid.entity.production,'sensor.grid_export');
assert.equal(config.entities.solar.entity,'sensor.solar_power');
assert.equal(config.entities.home.entity,'sensor.energy_site_consumption_power_kw');
assert.equal(config.entities.home.override_state,true,'plugin must display measured Home, never derived source balance');
assert.equal(env.buildRhiPowerFlowCardConfig(runtime(data,{available:false,entity_id:'sensor.energy_site_consumption_power_kw',unit:'kW'})),null,'no native site metric means no implied site balance');
assert.equal(env.buildRhiPowerFlowCardConfig(runtime(data,{available:true,entity_id:null,unit:'kW'})),null,'no invented HA entity identity');
assert.equal(env.buildRhiPowerFlowCardConfig(runtime(data,{available:true,entity_id:'sensor.energy_site_consumption_power_kw',unit:'kWh'})),null,'energy counter cannot drive instantaneous power');
assert.equal(env.buildRhiPowerFlowCardConfig(runtime(data,{available:true,entity_id:'sensor.energy_site_consumption_power_kw',unit:'kW',value:'0'})).entities.home.entity,'sensor.energy_site_consumption_power_kw','valid zero site demand remains a supported native metric');
assert.ok(!config.entities.battery,'must not invent battery direction');
assert.ok(!config.entities.individual,'no inferred consumer sensors');
const vehicle= {...good('flexible_load.power_kw','flexible_load','sensor.vehicle_power'),asset_id:'vehicle_a',asset_display_name:'EV A'};
const charger= {...good('flexible_load.power_kw','flexible_load','sensor.charger_power'),asset_id:'charger_a',asset_display_name:'Wallbox A'};
const onlyMeasured=env.buildRhiPowerFlowCardConfig({
 ...runtime([...data,vehicle,charger]),
 asset:id=>id==='charger_a'?{asset_type:'charger'}:{asset_type:'vehicle'}
});
assert.equal(onlyMeasured.entities.individual.length,1,'charger infrastructure must never be counted as a second load');
assert.equal(onlyMeasured.entities.individual[0].entity,'sensor.vehicle_power');
assert.equal(onlyMeasured.entities.individual[0].name,'EV A');
const repeated=env.buildRhiPowerFlowCardConfig({
 ...runtime([...data,vehicle,{...vehicle,asset_id:'vehicle_b',asset_display_name:'EV B'}]),
 asset:()=>({asset_type:'vehicle'})
});
assert.equal(repeated.entities.individual.length,1,'same measured HA sensor must not be double-counted');
const ambiguous=env.buildRhiPowerFlowCardConfig({
 ...runtime([...data,vehicle,{...vehicle,entity_id:'sensor.other_power'}]),
 asset:()=>({asset_type:'vehicle'})
});
assert.ok(!ambiguous.entities.individual,'ambiguous per-consumer authority must fail closed');
const missingPower=env.buildRhiPowerFlowCardConfig({
 ...runtime([...data,{...vehicle,availability:'UNAVAILABLE'}]),
 asset:()=>({asset_type:'vehicle'})
});
assert.ok(!missingPower.entities.individual,'unavailable consumer power must never animate');

assert.equal(env.buildRhiPowerFlowCardConfig(runtime(data.concat(data[0]))).entities.grid.entity.consumption,undefined,'ambiguous power source must fail closed');
assert.equal(env.buildRhiPowerFlowCardConfig(runtime(data.map(r=>({...r,availability:'UNAVAILABLE'})))),null,'unknown power cannot be shown as live');
assert.equal(env.buildRhiPowerFlowCardConfig(runtime([{...data[2],unit:'kWh'}])),null,'never feed accumulated energy into live power');
assert.ok(app.includes('helpers.createCardElement(config)'),'must instantiate real HA card');
assert.ok(app.includes('this.mountPowerFlowCard();'),'must mount after rendering');
assert.ok(app.includes('data-rhi-power-flow-host'),'must have Flow host');
assert.ok(app.includes("this.flexibleAssetDomain(rt).consumerFacing()"),'must show full consumer inventory');
assert.ok(!app.includes('this.flowNode(\'☀\',\'Solar\''),'remove obsolete static dots');
assert.ok(app.includes('this.canonicalConnectionSnapshot(rt)'),'retain canonical charger relationships');
console.log('PASS Power Flow Card Plus native site metric integration, exact identity, unknown vs zero, units and no double counting');
