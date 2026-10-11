const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const app = fs.readFileSync("src/app/energy-card.js","utf8");
const sandbox = {console,Object,Array,Map,Set,String,Number,Boolean,JSON};
vm.createContext(sandbox);
for(const path of ["src/runtime/canonical-property-index.js","src/runtime/command-contract.js",
  "src/runtime/energy-v2-contract.js"])
  vm.runInContext(fs.readFileSync(path,"utf8"),sandbox,{filename:path});
const object={state:"OK",attributes:{
  canonical_contract:"RHI_ENERGY_CANONICAL_OBJECT_V2",asset_id:"battery_1",
  logical_object_class:"battery",display_name:"Battery 1",availability:"AVAILABLE"
}};
const field=(key,value,unit,availability="AVAILABLE")=>({
  state:value===null?"unavailable":String(value),
  attributes:{canonical_contract:"RHI_ENERGY_CANONICAL_PROPERTY_V2",
    asset_id:"battery_1",logical_object_class:"battery",property_key:key,
    value,unit,availability,quality:availability==="AVAILABLE"?"AUTHORITATIVE":"NOT_ASSESSED",
    presentation_family:"battery",presentation_role:"key",presentation_surface:"details"}
});
const hass={states:{
  "sensor.battery":object,
  "sensor.battery_power":field("battery.power_kw",-1.25,"kW"),
  "sensor.battery_soc":field("battery.soc_pct",54.6,"%"),
  "sensor.battery_temperature":field("battery.temperature_c",null,"°C","UNAVAILABLE")
}};
const store=sandbox.readEnergyCanonicalProduct({host:{
  hass,canonicalIndex:sandbox.createEnergyCanonicalPropertyIndex(hass)}});
assert.equal(store.object("battery_1").display_name,"Battery 1");
const power=store.field("battery.power_kw","battery_1");
assert.equal(power.resolved,true);
assert.equal(power.status,"AVAILABLE");
assert.equal(power.quality,"AUTHORITATIVE");
assert.equal(power.value,-1.25);
const soc=store.field("battery.soc_pct","battery_1");
assert.equal(soc.resolved,true);
assert.equal(soc.value,54.6);
const temp=store.field("battery.temperature_c","battery_1");
assert.equal(temp.resolved,false,"unavailable native property remains unavailable");
assert.equal(temp.status,"UNAVAILABLE");

for (const objectType of [
  "battery:","battery_system:","home_battery_system:",
  "solar_production:","solar_array:","solar_zone:","solar_panel:","solar_optimizer:",
  "solar_inverter:","grid_connection:","gas_meter:",
  "flexible_load:","vehicle:","charger:","site_consumption:","home_consumption:",
  "backup_interface:","energy_system:"
]) {
  assert.ok(app.includes(objectType), "missing explicit primary-property contract for "+objectType);
}

assert.match(app,/for \(const key of spec\.keys \|\| \[spec\.key\]\)/);
assert.match(app,/home_consumption\.power_kw/);
assert.match(app,/solar_zone\.power_w/);
assert.match(app,/More information/);
assert.match(app,/rhiUxAssetIdentity\(/);
assert.match(app,/rhiUxAssetFactGrid\(/);
assert.match(app,/projection\?\.properties/);
assert.match(app,/\['solar_array','solar_zone'\]/);
assert.match(app,/productionSection/);
assert.match(app,/this\.batteryChildCard\(rt,String\(firstDefined\(asset\.asset_id/);
assert.doesNotMatch(app,/\['solar_production','solar_array','solar_zone'\]/);

console.log("PASS primary object truth, semantic availability and Details depth");
