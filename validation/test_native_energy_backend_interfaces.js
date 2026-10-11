/* Native Energy end-to-end contract regression. No Public V2 snapshots or entity-ID guessing. */
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const ctx={console,Map,Set,Object,Array,Number,String,Boolean,JSON};
vm.createContext(ctx);
for(const path of [
  'src/runtime/canonical-property-index.js',
  'src/runtime/command-contract.js',
  'src/runtime/energy-v2-contract.js',
  'src/domain/selectors/energy-selectors.js'
])vm.runInContext(fs.readFileSync(path,'utf8'),ctx,{filename:path});
const object=(id,cls,extras={})=>({
  state:'OK',attributes:{canonical_contract:'RHI_ENERGY_CANONICAL_OBJECT_V2',
    asset_id:id,logical_object_class:cls,display_name:id,
    availability:'AVAILABLE',...extras}
});
const property=(asset,cls,key,value,extras={})=>({
  state:value===null?'unavailable':String(value),attributes:{
    canonical_contract:'RHI_ENERGY_CANONICAL_PROPERTY_V2',
    asset_id:asset,logical_object_class:cls,property_key:key,
    value,availability:value===null?'UNAVAILABLE':'AVAILABLE',
    quality:'authoritative',presentation_family:'flow',presentation_role:'key',
    presentation_surface:'overview',...extras}
});
const metric=(key,value,extra={})=>({
  state:value===null?'unavailable':String(value),
  attributes:{canonical_source:'rhi_energy.runtime',metric_key:key,
    availability:value===null?'UNAVAILABLE':'AVAILABLE',quality:'AVAILABLE',...extra}
});
const command=(id,key,role,permission=true,withInvoke=true)=>({
  state:permission?'idle':'unavailable',
  attributes:{canonical_contract:'RHI_ENERGY_CANONICAL_COMMAND_V1',
    asset_id:id,target_asset_id:id,command_id:key,command_key:key,role,label:role,
    supported:true,visible:true,execution_allowed:permission,
    availability:permission?'AVAILABLE':'UNAVAILABLE',blocked_reason:permission?'':'not_ready',
    invoke:withInvoke ? {service:'rhi_energy.invoke_command',
      data:{command_id:key,target_asset_id:id}} : {}}
});
const hass={states:{
  'sensor.site_status':object('energy_site','energy_site'),
  'sensor.home_status':object('home_consumption','home_consumption',
    {parent_asset_id:'energy_site',visual_ref:'energy.home'}),
  'sensor.home_kw':property('home_consumption','home_consumption','home_consumption.power_kw',0),
  'sensor.battery_status':object('battery_one','battery',{parent_asset_id:'battery_system'}),
  'sensor.battery_soc':property('battery_one','battery','battery.soc_pct',63,
    {asset_display_name:'Battery One',parent_asset_id:'battery_system'}),
  'number.energy_vat':property('configuration:pricing','energy_configuration',
    'pricing.import_vat_pct',6,{presentation_family:'pricing',
      presentation_role:'configuration',presentation_surface:'configuration',
      editor:'number',editable:true,write_supported:true,constraints:{min:0,max:100},
      write:{supported:true,operation_id:'energy.property.write',
        service:'rhi_energy.write_property',
        data:{property_id:'pricing.import_vat_pct'},value_parameter:'value',
        readback_property:'pricing.import_vat_pct'}}),
  'select.battery_objective':property('configuration:battery','energy_configuration',
    'battery.objective','balanced',{presentation_family:'strategy',
      presentation_role:'configuration',presentation_surface:'configuration',
      editor:'select',editable:true,write_supported:true,
      constraints:{allowed:['balanced','solar_first']},
      write:{supported:true,operation_id:'energy.property.write',
        service:'rhi_energy.write_property',data:{property_id:'battery.objective'},
        value_parameter:'value',readback_property:'battery.objective'}}),
  'sensor.native_home':metric('home_consumption_power_kw',0),
  'sensor.net_financial':metric('net_financial_result_eur',12.4,{period:'today',actual_complete:true}),
  'button.charger_start':command('vehicle_a','energy.command.start_flexible_load','start'),
  'button.charger_stop':command('vehicle_a','energy.command.stop_flexible_load','stop',false),
}};
const totals=['required_kwh','planned_kwh','still_to_plan_kwh',
  'flexible_required_kwh','flexible_planned_kwh','flexible_still_to_plan_kwh'];
totals.forEach((field,i)=>{
  hass.states['sensor.d0_'+field]=metric('planning_today_'+field,i===0?0:i);
  if(i!==5)hass.states['sensor.d1_'+field]=metric('planning_tomorrow_'+field,i===0?4:i);
});
const index=ctx.createEnergyCanonicalPropertyIndex(hass);
const host={hass,canonicalIndex:index};
const gateway={host};
const product=ctx.readEnergyCanonicalProduct(gateway);
assert.equal(product.available,true);
assert.equal(product.object('battery_one').parent_asset_id,'battery_system');
assert.equal(product.object('battery_one').visual_ref,'');
assert.equal(product.currentField('home_consumption.power_kw').value,0);
assert.equal(product.core.home.power_kw,0);
assert.equal(product.property('pricing.import_vat_pct','configuration:pricing')?.write.service,'rhi_energy.write_property');
assert.equal(product.configuration.pricing.properties.length,1);
assert.equal(product.configuration.strategy.profiles.length,1);
assert.equal(product.configuration.strategy.profiles[0].profile_id,'battery');
assert.equal(product.planning.horizons.D0.required_kwh,0);
assert.equal(product.planning.horizons.D0.flexible_planned_kwh,4);
assert.equal(product.planning.horizons.D1.flexible_still_to_plan_kwh,null);
assert.equal(product.planning.horizons.D1.status,'INCOMPLETE');
assert.equal(product.valueAccounting.periods.today.net_financial_result_eur,12.4);
assert.equal(product.valueAccounting.periods.month,undefined);
assert.equal(ctx.selectEnergyValue(product,'month').net_financial_result_eur,null);
const nativeCommands=ctx.readEnergyCommandContract(gateway);
assert.equal(nativeCommands.rows.length,2);
assert.equal(nativeCommands.rows.find(r=>r.role==='start').enabled,true);
assert.equal(nativeCommands.rows.find(r=>r.role==='stop').enabled,false);
assert.equal(nativeCommands.rows.find(r=>r.role==='start').blocked_reason,'');
assert.equal(product.commands.length,2);
const incomplete={states:{'button.unsafe':command('vehicle_a','unsafe.command','start',true,false)}};
assert.equal(ctx.readEnergyCommandContract({host:{hass:incomplete}}).rows[0].enabled,false);
const duplicated={states:{...hass.states,
  'sensor.battery_duplicate':object('battery_one','battery')}};
const duplicateIndex=ctx.createEnergyCanonicalPropertyIndex(duplicated);
const duplicateProduct=ctx.readEnergyCanonicalProduct({host:{hass:duplicated,canonicalIndex:duplicateIndex}});
assert.equal(duplicateIndex.object('battery_one'),null);
assert.equal(duplicateProduct.object('battery_one'),null);
const duplicateCommand={states:{...hass.states,
  'button.start_duplicate':command('vehicle_a','energy.command.start_flexible_load','start')}};
const dupCmds=ctx.readEnergyCommandContract({host:{hass:duplicateCommand}});
assert.equal(dupCmds.rows.some(r=>r.role==='start'),false);
const noEnergy={states:{'sensor.price':metric('net_financial_result_eur',null,{period:'today'})}};
assert.equal(ctx.readNativeEnergyMetric(noEnergy,'net_financial_result_eur').available,false);
console.log('PASS native Energy canonical identity, 0 kW, configuration, D0/D1, period finance, exact commands and ambiguity guards');
