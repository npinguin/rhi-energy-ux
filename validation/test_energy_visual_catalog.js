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
  },
  asArray:value => Array.isArray(value) ? value : (value && typeof value === "object" ? Object.values(value) : [])
};
context.globalThis=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync("src/app/energy-asset-catalog.js","utf8"),context);
vm.runInContext(fs.readFileSync("src/runtime/visual-registry.js","utf8"),context);
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

// Producer-owned cross-domain visuals remain authoritative for flexible loads.
const producerRef="mobility.vehicle.generic.fallback";
const hass={states:{
  "sensor.rhi_foundation_visual_asset_registry":{
    state:"1",
    attributes:{
      contract_id:"RHI_VISUAL_ASSET_REGISTRY_V1",
      contract_version:"1.1.0",
      status:"valid",
      entries:[{
        visual_ref:producerRef,
        asset_type:"vehicle",
        owner_domain:"rhi_mobility",
        revision:2,
        variant_keys:["card"],
        presentation:{package_id:"rhi-mobility-ux",variants:{card:"assets/vehicles/vehicle_fallback.png"}}
      }]
    }
  }
}};
const producer={asset_id:"vehicle_1",asset_type:"flexible_load",source_domain:"rhi_mobility",visual_ref:producerRef};
const producerResolved=context.resolveEnergyAssetVisual(producer,hass,"card");
assert.equal(producerResolved.kind,"vehicle");
assert.equal(producerResolved.visual_ref,producerRef);
assert.equal(producerResolved.owner_domain,"rhi_mobility");

const picker=fs.readFileSync("src/ui/components/energy-visual-picker.js","utf8");
assert.match(picker,/catalogFor\(asset/);
assert.match(picker,/rhiEnergyVisualCatalogForType/);
assert.match(picker,/data-energy-visual-select/);

console.log("PASS Energy logical-device visual catalog and type-safe picker");
