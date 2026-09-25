const fs = require('fs');
const vm = require('vm');

const context = {
  console,
  Object, Array, Map, Set, String, Number, Boolean, JSON,
  parseMaybeJson: (value, fallback = null) => {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value !== 'string') return value;
    try { return JSON.parse(value); } catch { return fallback; }
  }
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('src/runtime/energy-v2-contract.js','utf8'), context);

const states = {
  'sensor.rhi_energy_public_contract_v2': {
    state:'OK',
    attributes:{
      contract_id:'RHI_ENERGY_PUBLIC_CONTRACT_V2',
      contract_version:'2.0.0',
      release:'E0.15.46',
      summary:{object_count:2},
      objects:[
        {
          asset_id:'battery_system',
          display_name:'Home Battery',
          object_class:'battery_system',
          profile_id:'battery.default',
          visual_ref:'energy:battery',
          health:'OK',
          property_publication:{complete:true,resolution_complete:true},
          properties:[
            {property_key:'battery.soc_pct',value:72,unit:'%',resolution:{status:'RESOLVED'},quality:'authoritative'},
            {property_key:'battery.reserve_target_pct',value:20,unit:'%',resolution:{status:'RESOLVED'},write_supported:true,editor:'number',constraints:{min:5,max:80},write:{operation_id:'energy.property.write',service:'rhi_energy.write_property'}}
          ],
          controls:[{control_id:'battery.reserve_target_pct',supported:true,operation_id:'energy.property.write'}]
        },
        {asset_id:'home_consumption',display_name:'Home',object_class:'home_consumption',properties:[]}
      ],
      profiles:[{profile_id:'battery.default',asset_type:'battery_system'}],
      relationships:[{relationship_id:'energy:home:contains:battery',source_asset_id:'home_consumption',target_asset_id:'battery_system',relationship_type:'contains',source_domain:'energy'}],
      planning:{planning_horizons:{D0:{summary:{lane_totals:{}}},D1:{summary:{lane_totals:{}}}}},
      intelligence:{availability:'AVAILABLE'},
      overview:{status:{code:'self_powered'}},
      commands:[{command_id:'energy.command.test',target_asset_id:'battery_system'}]
    }
  }
};
const host={state:id=>states[id]||null};
const gateway={
  contract(key){
    if(key!=='publicV2') throw new Error('legacy contract access:'+key);
    const state=host.state('sensor.rhi_energy_public_contract_v2');
    return {entityId:'sensor.rhi_energy_public_contract_v2',state:state.state,available:true,attributes:state.attributes,contractVersion:'2.0.0'};
  }
};
const v2=context.readEnergyPublicV2(gateway);
if(!v2.available) throw new Error('V2 contract not available');
if(v2.objects.length!==2) throw new Error('objects lost');
if(v2.relationships[0].from_asset_id!=='home_consumption' || v2.relationships[0].to_asset_id!=='battery_system') throw new Error('relationship aliases missing');
const soc=v2.field('battery.soc_pct','battery_system');
if(!soc.resolved || soc.value!==72 || soc.unit!=='%') throw new Error('typed field projection failed');
const reserve=v2.field('battery.reserve_target_pct','battery_system');
if(!reserve.editable || reserve.write?.service!=='rhi_energy.write_property') throw new Error('canonical write metadata lost');
const asset=context.createEnergyAssetProjection(v2,'battery_system');
if(asset.identity.display_name!=='Home Battery' || asset.controls.length!==1 || asset.relationships.length!==1) throw new Error('asset projection incomplete');
console.log('PASS canonical Energy V2 projection reader');
