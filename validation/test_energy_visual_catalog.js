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

const battery={asset_id:"battery_1",asset_type:"battery",profile_id:"unknown"};
const inverter={asset_id:"inverter_1",asset_type:"solar_inverter",profile_id:"unknown"};
const zone={asset_id:"zone_1",asset_type:"solar_zone",profile_id:""};
const grid={asset_id:"grid_1",asset_type:"grid_connection",profile_id:"energy.grid_connection.homewizard"};

const physicalTypes=[
  "battery_system","battery","solar_zone","solar_panel","solar_inverter",
  "solar_optimizer","backup_interface","gas_meter","grid_meter"
];

for (const type of physicalTypes) {
  const rows=context.rhiEnergyVisualCatalogForType(type);
  assert.ok(rows.length>=1, "missing physical catalog entries for "+type);
  assert.ok(rows.every(row=>row.asset_type===type));
}

for (const logicalType of ["grid_connection","grid_phase","solar_production","solar_forecast","price_source","home_consumption","flexible_load","consumer","energy_system"]) {
  assert.equal(context.rhiEnergyVisualCatalogForType(logicalType).length,0,"logical concept leaked into physical catalog: "+logicalType);
}

const batteryDefault=context.rhiEnergyDefaultVisualEntry(battery);
assert.equal(batteryDefault.id,"battery.byd_lvs_20");
assert.equal(context.rhiEnergyDefaultVisualEntry(inverter).id,"solar_inverter.solaredge_rwb_10k");
assert.equal(context.rhiEnergyDefaultVisualEntry(zone).id,"solar_zone.generic");
assert.equal(context.rhiEnergyDefaultVisualEntry(grid),null);

const configured=context.rhiEnergyVisualRef(context.rhiEnergyVisualCatalogForType("battery")[1]);
const persistedBattery={...battery,visual_ref:configured,appearance:{configured_visual_ref:configured,effective_visual_ref:configured,editable:true}};
const resolved=context.resolveEnergyAssetVisual(persistedBattery);
assert.ok(resolved && resolved.url);
assert.equal(resolved.asset_type,"battery");
assert.equal(resolved.visual_ref,configured);

const defaultResolved=context.resolveEnergyAssetVisual(battery);
assert.ok(defaultResolved && defaultResolved.url);
assert.equal(defaultResolved.asset_type,"battery");
assert.match(defaultResolved.url,/byd_lvs_20\.webp/);

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

const catalogSource=fs.readFileSync("src/app/energy-asset-catalog.js","utf8");
assert.doesNotMatch(catalogSource,/heroes\//);
assert.doesNotMatch(catalogSource,/localStorage|visual_preferences|rhiEnergySetVisualPreference|rhiEnergySelectedVisualRef/);

console.log("PASS Energy physical visual catalog, same-concept defaults and cross-domain fail-closed resolution");
