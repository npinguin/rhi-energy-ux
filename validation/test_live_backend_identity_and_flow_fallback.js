const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source=fs.readFileSync('src/app/energy-card.js','utf8');
const begin=source.indexOf('\n    releaseAttrs() {');
const end=source.indexOf('\n    publicUxEntities()',begin);
assert.ok(begin>0&&end>begin,'release contract reader');
const reader=vm.runInNewContext('({'+source.slice(begin,end)+'})').releaseAttrs;
const state=(attrs,entityState='unknown')=>({attributes:attrs,state:entityState});
const energyAttrs={canonical_contract:'RHI_ENERGY_CANONICAL_PROPERTY_V2',publisher_release:'E0.15.140'};
const runtime={hass:{states:{
  'sensor.energy_home_consumption':state(energyAttrs,'1.25'),
  'sensor.rhi_energy_release':null
}},releaseState:()=>null};
assert.equal(reader.call(runtime).backend_release,'E0.15.140','canonical release survives disabled diagnostics');
const conflicting={...runtime,hass:{states:{
  a:state(energyAttrs),b:state({...energyAttrs,publisher_release:'E0.15.139'})
}}};
assert.equal(reader.call(conflicting).backend_release,'unknown','never hide disagreeing canonical publisher identities');
assert.equal(reader.call({...runtime,hass:{states:{}}}).backend_release,'unknown','absence is unknown');
assert.equal(reader.call({...runtime,hass:{states:{}},releaseState:()=>state({},'E0.15.139')}).backend_release,'E0.15.139','legacy sensor is optional supplemental evidence');
const beginFlow=source.indexOf('\n    flow(rt) {');
const endFlow=source.indexOf('\n    renderFlowContent(rt) {',beginFlow);
assert.ok(beginFlow>0&&endFlow>beginFlow,'flow isolation boundary');
const block=source.slice(beginFlow,endFlow);
const handlers=vm.runInNewContext('({'+block+'})',{
  console:{error:()=>{}},
  readLiveConsumptionContract:()=>({siteConsumptionKw:1.246,homeConsumptionKw:1.246,flexibleLoadsKw:0})
});
const screen={
  renderFlowContent:()=>{throw Error('connection display failed')},
  currentEnergyModel:()=>({solar:{powerKw:0},grid:{importPowerKw:1.246,exportPowerKw:0},battery:{valueAvailable:false}}),
  buildPageViewModel:()=>({title:'Flow'}),
  tabExperienceHeader:()=>'<header>Flow</header>',
  nativeFlowEvidence:(_c,physical)=>'<main>'+physical.homeConsumptionKw+'</main>'
};
const out=handlers.flow.call(screen,{contractGateway:()=>({})});
assert.match(out,/Measured energy values remain available/);
assert.match(out,/1.246/);
assert.match(out,/Flow/);
assert.equal(screen._flowRenderFailure,'connection display failed');
assert.ok(source.includes('if (!footer.runtimeTrusted) issues.push('),'canonical availability is sole false-contract warning authority');
assert.ok(!source.includes("return [\n        [RELEASE_ENTITY,'Energy release diagnostics'"),'disabled optional diagnostic cannot be a blocking contract');
console.log('PASS canonical backend version identity, conflict detection, and fault-isolated Flow');
