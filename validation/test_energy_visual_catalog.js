const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const context = {
  console,
  UX_VERSION:"test",
  HERO_IMAGE_BYD_LVS20:"data:image/webp;base64,test",
  globalThis:null
};
context.globalThis=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync("src/app/energy-asset-catalog.js","utf8"),context);
context.parseMaybeJson=(value,fallback=null)=>{if(value===undefined||value===null||value==="")return fallback;if(typeof value!=="string")return value;try{return JSON.parse(value)}catch{return fallback}};
vm.runInContext(fs.readFileSync("src/runtime/foundation-visual-registry.js","utf8"),context);
vm.runInContext(fs.readFileSync("src/runtime/visual-asset-resolver.js","utf8"),context);

const battery={asset_id:"battery_1",asset_type:"battery",profile_id:"energy.battery.solaredge_modbus_multi",integration_domain:"solaredge_modbus_multi"};
const inverter={asset_id:"inverter_1",asset_type:"solar_inverter",profile_id:"energy.solar_inverter.solaredge_modbus_multi",integration_domain:"solaredge_modbus_multi"};
const grid={asset_id:"grid_1",asset_type:"grid_connection",profile_id:"energy.grid_connection.homewizard",integration_domain:"homewizard"};

const batteryChoices=context.rhiEnergyVisualCatalogForType("battery");
assert.ok(batteryChoices.length >= 2);
assert.ok(batteryChoices.every(row=>row.asset_type==="battery"));
assert.ok(context.rhiEnergyVisualCatalogForType("solar_inverter").every(row=>row.asset_type==="solar_inverter"));

assert.equal(context.rhiEnergyVisualRef(batteryChoices.find(row=>row.id==="battery.solaredge_home_48v_9_6")),"energy.battery.solaredge.48v");
assert.equal(context.rhiEnergyVisualRef(batteryChoices.find(row=>row.id==="battery.home")),"energy.battery.generic");
assert.equal(context.rhiEnergyVisualRef(context.rhiEnergyVisualCatalogForType("solar_inverter").find(row=>row.id==="solar_inverter.solaredge_rws_8k")),"energy.solar_inverter.solaredge.rws");

const batteryDefault=context.rhiEnergyDefaultVisualEntry(battery);
assert.equal(batteryDefault.asset_type,"battery");
assert.equal(context.rhiEnergyDefaultVisualEntry(inverter).asset_type,"solar_inverter");
assert.equal(context.rhiEnergyDefaultVisualEntry(grid).asset_type,"grid_connection");

const selected={...battery,visual_ref:"energy.battery.solaredge.48v"};
const resolved=context.resolveEnergyAssetVisual(selected);
assert.ok(resolved && resolved.url);
assert.equal(resolved.asset_type,"battery");
assert.equal(resolved.visual_ref,"energy.battery.solaredge.48v");

// Producer-owned cross-domain visuals remain authoritative and can only resolve through Foundation.
const producer={asset_id:"vehicle_1",asset_type:"flexible_load",visual_ref:"mobility.vehicle.generic.fallback"};
assert.equal(context.resolveEnergyAssetVisual(producer),null,"producer ref without Foundation registry must fail closed");
const producerRegistry={
  available:true,
  entry:ref=>ref==="mobility.vehicle.generic.fallback" ? {
    visual_ref:ref,
    owner_domain:"rhi_mobility",
    asset_type:"vehicle",
    revision:2,
    presentation:{package_id:"rhi-mobility-ux",variants:{card:"assets/vehicles/vehicle_fallback.png"}}
  } : null
};
const producerResolved=context.resolveEnergyAssetVisual(producer,producerRegistry,"card");
assert.equal(producerResolved.kind,"vehicle");
assert.equal(producerResolved.visual_ref,"mobility.vehicle.generic.fallback");
assert.match(producerResolved.url,/^\/hacsfiles\/rhi-mobility-ux\/assets\/vehicles\/vehicle_fallback\.png\?r=2$/);

const catalogSource=fs.readFileSync("src/app/energy-asset-catalog.js","utf8");
assert.doesNotMatch(catalogSource,/homebrain\.energy\.visual_preferences/);
assert.doesNotMatch(catalogSource,/localStorage/);
const picker=fs.readFileSync("src/ui/components/energy-visual-picker.js","utf8");
assert.match(picker,/rhiUxVisualPickerShell/);
assert.match(picker,/data-energy-visual-select/);

console.log("PASS backend-canonical Energy visual catalog and producer-owned Mobility preservation");
