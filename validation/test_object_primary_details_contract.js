const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const contractSource = fs.readFileSync("src/runtime/energy-v2-contract.js","utf8");
const app = fs.readFileSync("src/app/energy-card.js","utf8");

const sandbox = {
  parseMaybeJson(value, fallback) {
    if (typeof value !== "string") return value ?? fallback;
    try { return JSON.parse(value); } catch { return fallback; }
  },
  console
};
vm.createContext(sandbox);
vm.runInContext(contractSource, sandbox);

const gateway = {
  contract() {
    return {
      available:true,
      state:"READY",
      contractVersion:"2",
      attributes:{
        contract_id:"RHI_ENERGY_PUBLIC_CONTRACT_V2",
        contract_version:"2",
        core:{ contract_id:"RHI_ENERGY_PUBLIC_CONTRACT_V2" },
        objects:[
          {
            asset_id:"battery_1",
            object_class:"battery",
            display_name:"Battery 1",
            health:"OK",
            properties:[
              {
                property_key:"battery.power_kw",
                display_name:"Power",
                status:"NORMALIZED",
                availability:"AVAILABLE",
                value:-1.25,
                unit:"kW",
                resolution:{status:"RESOLVED",quality:"AUTHORITATIVE",reason_code:"ACCEPTED_BINDING_VALUE"}
              },
              {
                property_key:"battery.soc_pct",
                display_name:"State of charge",
                status:"NORMALIZED",
                availability:"AVAILABLE",
                value:54.6,
                unit:"%",
                resolution:{status:"RESOLVED",quality:"AUTHORITATIVE"}
              },
              {
                property_key:"battery.temperature_c",
                display_name:"Temperature",
                status:"MATCHED",
                availability:"UNAVAILABLE",
                value:null,
                unit:"°C",
                resolution:{status:"UNAVAILABLE",quality:"NOT_ASSESSED",reason_code:"SOURCE_STATE_UNAVAILABLE"}
              }
            ]
          }
        ],
        profiles:[],
        relationships:[],
        commands:[],
        activity:[],
        planning:{},
        intelligence:{},
        overview:{},
        configuration:{},
        value_accounting:{},
        layers:{},
        summary:{}
      }
    };
  }
};

const store = sandbox.readEnergyPublicV2(gateway);
const power = store.field("battery.power_kw","battery_1");
assert.equal(power.resolved,true,"NORMALIZED + AVAILABLE property must resolve");
assert.equal(power.status,"AVAILABLE");
assert.equal(power.normalization_status,"NORMALIZED");
assert.equal(power.quality,"AUTHORITATIVE");
assert.equal(power.value,-1.25);

const soc = store.field("battery.soc_pct","battery_1");
assert.equal(soc.resolved,true);
assert.equal(soc.value,54.6);

const temp = store.field("battery.temperature_c","battery_1");
assert.equal(temp.resolved,false,"explicitly unavailable property must remain unavailable");
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
