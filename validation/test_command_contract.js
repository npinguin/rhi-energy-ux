// Native command publication / view-model regression, with no aggregate V2 ingress.
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const context={Object,Array,Map,Set,String,Number,Boolean,JSON,
  firstDefined:(...v)=>v.find(x=>x!==undefined&&x!==null),
  human:value=>String(value||'').replace(/_/g,' ')};
vm.createContext(context);
for(const path of ['src/runtime/command-contract.js','src/runtime/command-action-model.js'])
  vm.runInContext(fs.readFileSync(path,'utf8'),context,{filename:path});
const command=(id,role,visible=true,available=true,service='rhi_energy.invoke_command')=>({
  state:available?'idle':'unavailable',attributes:{
    canonical_contract:'RHI_ENERGY_CANONICAL_COMMAND_V1',
    asset_id:'vehicle_nicky',target_asset_id:'vehicle_nicky',command_id:id,role,
    supported:true,visible,execution_allowed:available,
    availability:available?'AVAILABLE':'UNAVAILABLE',
    blocked_reason:available?'':'Already paused',
    label:role==='pause'?'Pause Energy control':role==='start'?'Start charging':'Stop charging',
    invoke:{service,data:{command_id:id,target_asset_id:'vehicle_nicky'}}
  }
});
const states={
  'button.start':command('energy.command.start_flexible_load','start'),
  'button.stop':command('energy.command.stop_flexible_load','stop',false,false),
  'button.pause':command('energy.command.pause_flexible_load','pause',true,false)
};
const read=states=>context.readEnergyCommandContract({host:{hass:{states}}});
const contract=read(states);
const actions=context.commandActionModelsForAsset(contract,'vehicle_nicky');
assert.equal(contract.rows.length,3,'including hidden backend commands for diagnostic completeness');
assert.equal(actions.length,2,'hidden stop cannot be rendered as action');
assert.ok(actions.some(a=>a.role==='start'&&a.enabled&&a.label==='Start charging'&&a.owner==='energy'));
assert.ok(actions.some(a=>a.role==='pause'&&!a.enabled&&a.reason==='Already paused'));
assert.ok(!actions.some(a=>a.role==='stop'));
assert.equal(contract.rows.find(x=>x.role==='pause').enabled,false);
assert.equal(contract.rows.find(x=>x.role==='start').invoke.data.target_asset_id,'vehicle_nicky');
// Incomplete/mismatched service data must never enable a physical command.
const invalid=command('energy.command.start_flexible_load','start',true,true,'other.execute');
assert.equal(read({'button.unsafe':invalid}).rows[0].enabled,false);
const incorrect=command('energy.command.start_flexible_load','start');
incorrect.attributes.invoke.data.target_asset_id='another_vehicle';
assert.equal(read({'button.unsafe':incorrect}).rows[0].enabled,false);
// Duplicate canonical publishers fail closed, independent of discovery order.
assert.equal(read({...states,'button.start_duplicate':states['button.start']}).rows
  .some(row=>row.command_id==='energy.command.start_flexible_load'),false);
assert.equal(read({}).rows.length,0);
console.log('PASS native Energy command contract and action models: hidden, blocked, exact invoke and duplicates');
