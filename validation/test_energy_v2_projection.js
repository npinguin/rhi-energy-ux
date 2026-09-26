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
      release:'E0.15.52',
      core:{contract_id:'RHI_ENERGY_CORE_V1',
        battery:{status:'AVAILABLE',fields:{
          power_kw:{value:-1.2,unit:'kW',status:'AVAILABLE',quality:'CANONICAL',reason:null},
          soc_pct:{value:72,unit:'%',status:'AVAILABLE',quality:'CANONICAL',reason:null},
          capacity_kwh:{value:29.2,unit:'kWh',status:'AVAILABLE',quality:'CANONICAL',reason:null},
          available_kwh:{value:21.0,unit:'kWh',status:'AVAILABLE',quality:'CANONICAL',reason:null},
          state:{value:'charging',unit:null,status:'AVAILABLE',quality:'CANONICAL',reason:null},
          reserve_target_pct:{value:20,unit:'%',status:'AVAILABLE',quality:'CANONICAL',reason:null}
        },contributors:[]},
        solar:{status:'AVAILABLE',fields:{power_kw:{value:3.4,unit:'kW',status:'AVAILABLE',quality:'CANONICAL',reason:null}}},
        grid:{status:'AVAILABLE',fields:{
          net_power_kw:{value:-0.8,unit:'kW',status:'AVAILABLE',quality:'CANONICAL',reason:null},
          import_power_kw:{value:0,unit:'kW',status:'AVAILABLE',quality:'CANONICAL',reason:null},
          export_power_kw:{value:0.8,unit:'kW',status:'AVAILABLE',quality:'CANONICAL',reason:null},
          flow_direction:{value:'exporting',status:'AVAILABLE',quality:'CANONICAL',reason:null}
        }},
        consumption:{status:'AVAILABLE',fields:{power_kw:{value:2.6,unit:'kW',status:'AVAILABLE',quality:'CANONICAL',reason:null}}},
        home:{status:'AVAILABLE',fields:{power_kw:{value:1.8,unit:'kW',status:'AVAILABLE',quality:'CANONICAL',reason:null}}},
        flexible:{status:'AVAILABLE',producer_available:true,fields:{
          power_kw:{value:0.8,unit:'kW',status:'AVAILABLE',quality:'CANONICAL',reason:null},
          attributed_power_kw:{value:0.8,unit:'kW',status:'AVAILABLE',quality:'CANONICAL',reason:null}
        },assets:[{asset_id:'car_a',asset_type:'flexible_load',display_name:'Car A',power_kw:0.8}]}
      },
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
            {property_key:'battery.reserve_target_pct',value:20,unit:'%',resolution:{status:'RESOLVED'},write_supported:true,editor:'number',constraints:{min:5,max:80},write:{operation_id:'energy.property.write',service:'rhi_energy.write_property'}}
          ],
          controls:[{control_id:'battery.reserve_target_pct',supported:true,operation_id:'energy.property.write'}]
        }
      ],
      profiles:[{profile_id:'battery.default',asset_type:'battery_system'}],
      relationships:[{relationship_id:'energy:home:contains:battery',source_asset_id:'home_consumption',target_asset_id:'battery_system',relationship_type:'contains',source_domain:'energy'}],
      planning:{horizons:{D0:{required_kwh:19.2,planned_kwh:19.2,executed_kwh:null,still_to_plan_kwh:0,status:'AVAILABLE',execution_status:'NOT_MEASURED'},D1:{required_kwh:11,planned_kwh:4,still_to_plan_kwh:7,status:'AVAILABLE'}}},
      configuration:{strategy:{configured:{status:'AVAILABLE',properties:[]},effective:{status:'AVAILABLE',properties:[],runtime_overrides:[]}}},
      value_accounting:{selected_period_id:'today',net_financial_result:{value:1.23,unit:'EUR',status:'AVAILABLE'},periods:{today:{net_financial_result_eur:1.23}}},
      commands:[]
    }
  }
};
const gateway={contract(key){
  if(key!=='publicV2') throw new Error('legacy contract access:'+key);
  const state=states['sensor.rhi_energy_public_contract_v2'];
  return {entityId:'sensor.rhi_energy_public_contract_v2',state:state.state,available:true,attributes:state.attributes,contractVersion:'2.0.0'};
}};
const v2=context.readEnergyPublicV2(gateway);
if(!v2.available) throw new Error('V2 contract not available');
if(v2.field('battery.soc_pct').value!==72) throw new Error('core battery field not authoritative');
if(v2.field('site_consumption.power_kw').value!==2.6) throw new Error('core consumption field missing');
if(v2.flexibleAssets.length!==1 || v2.flexibleAssets[0].asset_id!=='car_a') throw new Error('core flexible assets not projected');
const reserve=v2.field('battery.reserve_target_pct','battery_system');
if(!reserve.editable || reserve.write?.service!=='rhi_energy.write_property') throw new Error('object write metadata lost');
const asset=context.createEnergyAssetProjection(v2,'battery_system');
if(asset.identity.display_name!=='Home Battery' || asset.controls.length!==1) throw new Error('asset projection incomplete');
console.log('PASS canonical Energy V2 core + object projection reader');

const incompleteGateway={contract(key){
  if(key!=='publicV2') throw new Error('legacy contract access:'+key);
  return {entityId:'sensor.rhi_energy_public_contract_v2',state:'OK',available:true,attributes:{
    contract_id:'RHI_ENERGY_PUBLIC_CONTRACT_V2',
    contract_version:'2.0.0',
    release:'E0.15.53',
    core:{contract_id:'RHI_ENERGY_CORE_V1',battery:{},solar:{},grid:{},consumption:{},home:{}}
  },contractVersion:'2.0.0'};
}};
const incomplete=context.readEnergyPublicV2(incompleteGateway);
if(incomplete.available) throw new Error('V2 must fail closed when required core sections are missing');
if(!String(incomplete.compatibilityReason).includes('flexible')) throw new Error('missing core capability reason must identify absent sections');
console.log('PASS required Energy core capability set fails closed');
