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
good('site_consumption.power_kw','site_consumption','sensor.site_power'),
good('battery.power_kw','battery_system','sensor.battery_power')];
const runtime=rows=>({canonicalIndex:{rowsForProperty:key=>rows.filter(r=>r.property_key===key)}});
const config=env.buildRhiPowerFlowCardConfig(runtime(data));
assert.ok(config,'known real sensors must configure a card');
assert.equal(config.type,'custom:power-flow-card-plus');
assert.equal(config.entities.grid.entity.consumption,'sensor.grid_import');
assert.equal(config.entities.grid.entity.production,'sensor.grid_export');
assert.equal(config.entities.solar.entity,'sensor.solar_power');
assert.equal(config.entities.home.entity,'sensor.site_power');
assert.equal(config.entities.home.override_state,true,'plugin must display measured Home, never derived source balance');
assert.equal(env.buildRhiPowerFlowCardConfig(runtime(data.filter(r=>r.property_key!=='site_consumption.power_kw'))),null,'no measured site demand means no implied home balance');
assert.ok(!config.entities.battery,'must not invent battery direction');
assert.ok(!config.entities.individual,'no inferred consumer sensors');
assert.equal(env.buildRhiPowerFlowCardConfig(runtime(data.concat(data[0]))).entities.grid.entity.consumption,undefined,'ambiguous power source must fail closed');
assert.equal(env.buildRhiPowerFlowCardConfig(runtime(data.map(r=>({...r,availability:'UNAVAILABLE'})))),null,'unknown power cannot be shown as live');
assert.equal(env.buildRhiPowerFlowCardConfig(runtime([{...data[2],unit:'kWh'}])),null,'never feed accumulated energy into live power');
assert.ok(app.includes('helpers.createCardElement(config)'),'must instantiate real HA card');
assert.ok(app.includes('this.mountPowerFlowCard();'),'must mount after rendering');
assert.ok(app.includes('data-rhi-power-flow-host'),'must have Flow host');
assert.ok(app.includes("this.flexibleAssetDomain(rt).consumerFacing()"),'must show full consumer inventory');
assert.ok(!app.includes('this.flowNode(\'☀\',\'Solar\''),'remove obsolete static dots');
assert.ok(app.includes('this.canonicalConnectionSnapshot(rt)'),'retain canonical charger relationships');
console.log('PASS Power Flow Card Plus native integration, real sensor ownership, units, ambiguity, full loads and no double counting');
