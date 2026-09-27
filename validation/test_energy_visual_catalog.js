const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const store = {};
const context = {
  console,
  UX_VERSION:"test",
  HERO_IMAGE_BYD_LVS20:"data:image/webp;base64,test",
  globalThis:null,
  localStorage:{
    getItem:key => store[key] || null,
    setItem:(key,value) => { store[key]=value; }
  }
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

const batteryDefault=context.rhiEnergyDefaultVisualEntry(battery);
assert.equal(batteryDefault.asset_type,"battery");
assert.match(context.rhiEnergyVisualRef(batteryDefault),/^energy\.logical\.battery\./);
assert.equal(context.rhiEnergyDefaultVisualEntry(inverter).asset_type,"solar_inverter");
assert.equal(context.rhiEnergyDefaultVisualEntry(grid).asset_type,"grid_connection");

const wrong=context.rhiEnergyVisualRef(context.rhiEnergyVisualCatalogForType("solar_inverter")[0]);
assert.equal(context.rhiEnergySetVisualPreference(battery,wrong),false);
const genericBattery=context.rhiEnergyVisualRef(batteryChoices.find(row=>row.id==="battery.home"));
assert.equal(context.rhiEnergySetVisualPreference(battery,genericBattery),true);
assert.equal(context.rhiEnergySelectedVisualRef("battery_1"),genericBattery);

const resolved=context.resolveEnergyAssetVisual(battery);
assert.ok(resolved && resolved.url);
assert.equal(resolved.asset_type,"battery");
assert.equal(resolved.visual_ref,genericBattery);

context.rhiEnergyClearVisualPreference("battery_1");
const defaultResolved=context.resolveEnergyAssetVisual(battery);
assert.ok(defaultResolved && defaultResolved.url);
assert.equal(defaultResolved.asset_type,"battery");

// Producer-owned cross-domain visuals remain authoritative but resolve only through Foundation.
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

const picker=fs.readFileSync("src/ui/components/energy-visual-picker.js","utf8");
assert.match(picker,/catalogFor\(asset/);
assert.match(picker,/rhiEnergyVisualCatalogForType/);
assert.match(picker,/data-energy-visual-select/);

console.log("PASS Energy logical-device visual catalog and type-safe picker");
