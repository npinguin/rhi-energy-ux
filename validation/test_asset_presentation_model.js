const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/domain/models/asset-presentation-model.js","utf8");
const context = { Object, Array, String };
vm.createContext(context);
vm.runInContext(source,context);

const projection = {
  identity:{asset_id:"battery_1",display_name:"Home Battery",asset_type:"battery",profile_id:"battery.generic",visual_ref:"energy.logical.battery.generic"},
  lifecycle:{state:"READY",publication:{complete:true}},
  relationships:[{source_asset_id:"battery_1",target_asset_id:"battery_system"}],
  controls:[],
  profile:{display_name:"Battery"},
  properties:[
    {property_key:"battery.soc_pct",display_name:"State of charge",presentation:{role:"key",family:"energy"},projection:{resolved:true,value:0,display:"0",unit:"%"}},
    {property_key:"battery.capacity_kwh",display_name:"Capacity",presentation:{role:"detail",family:"energy"},projection:{resolved:true,value:29.2,display:"29.2",unit:"kWh"}},
    {property_key:"battery.reserve_target_pct",display_name:"Reserve",presentation:{role:"configuration",family:"configuration"},editable:true,projection:{resolved:true,value:20,display:"20",unit:"%",editable:true}},
    {property_key:"source.binding",display_name:"Source binding",presentation:{role:"diagnostics",family:"diagnostics"},projection:{resolved:false,value:null,display:"—",reason:"not_available"}},
    {property_key:"battery.mystery",display_name:"Mystery",projection:{resolved:true,value:42,display:"42"}}
  ]
};

const model = vm.runInContext("createEnergyAssetPresentationModel",context)(projection);
assert.equal(model.identity.asset_id,"battery_1");
assert.equal(model.keyFacts.length,1);
assert.equal(model.keyFacts[0].display,"0 %","legitimate zero must survive presentation");
assert.equal(model.details.length,1);
assert.equal(model.configuration.length,1);
assert.equal(model.diagnostics.length,1);
assert.equal(model.unmapped.length,1,"missing backend presentation role must remain explicit");
assert.equal(model.unmapped[0].key,"battery.mystery");
assert.ok(!model.keyFacts.some(row=>row.key==="battery.mystery"),"frontend must not infer missing presentation role");
console.log("PASS Energy AssetPresentationModel is backend-role-driven and fail-closed");
