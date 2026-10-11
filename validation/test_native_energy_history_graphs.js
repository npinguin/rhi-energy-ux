const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const app = fs.readFileSync('src/app/energy-card.js','utf8');
const presentation = fs.readFileSync('src/app/presentation.js','utf8');
const between = (start,end) => {
  const i0=app.indexOf('\n    '+start+'(');
  const i1=app.indexOf('\n    async '+start+'(');
  const i=i0<0?i1:i1<0?i0:Math.min(i0,i1);
  const j0=app.indexOf('\n    '+end+'(',i+1);
  const j1=app.indexOf('\n    async '+end+'(',i+1);
  const j=j0<0?j1:j1<0?j0:Math.min(j0,j1);
  assert.ok(i>0 && j>i, 'history method boundaries '+start+'/'+end);
  return app.slice(i,j);
};
const methods = [
  between('canonicalEnergyHistorySensor','energyHistorySection'),
  between('energyHistorySection','mountEnergyHistoryGraphs'),
  between('mountEnergyHistoryGraphs','mountGasStatisticsGraph')
].join(',');
const context={escapeHtml:value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),
  window:{}, Number, String};
vm.createContext(context);
const history=vm.runInContext('({'+methods+'})',context);
const entity='sensor.rhi_energy_solar_production_power';
const indexed = rows => ({ canonicalIndex:{ rowsForProperty:key=>rows.filter(x=>x.property_key===key) } });
const row={property_key:'solar.power_kw',logical_object_class:'solar_production',entity_id:entity,availability:'AVAILABLE'};
const source=history.canonicalEnergyHistorySensor.bind({_hass:{states:{[entity]:{state:'0'}}}});
assert.equal(source(indexed([row]),'solar.power_kw','solar_production'),entity,'published zero remains a valid history source');
assert.equal(source(indexed([row,row]),'solar.power_kw','solar_production'),'','ambiguous canonical source must fail closed');
assert.equal(source(indexed([{...row,entity_id:'switch.invalid'}]),'solar.power_kw','solar_production'),'','non-sensor source forbidden');
assert.equal(source(indexed([{...row,availability:'UNAVAILABLE'}]),'solar.power_kw','solar_production'),'','unavailable canonical row must not be claimed available');
assert.equal(source(indexed([{...row,logical_object_class:'battery'}]),'solar.power_kw','solar_production'),'','wrong logical class is not Solar');
const fake={canonicalEnergyHistorySensor:()=>entity,selectedEnergyHistoryPeriodId:'week'};
const solar=history.energyHistorySection.call(fake,indexed([row]),'solar');
assert.match(solar,/Solar production power history/);
assert.match(solar,/Measured solar power \(kW\)/);
assert.match(solar,/data-hours-to-show="168"/);
assert.match(solar,/data-energy-history-period="month"/);
const missing=history.energyHistorySection.call({canonicalEnergyHistorySensor:()=>''},indexed([]),'battery');
assert.match(missing,/Measured history unavailable/);
assert.doesNotMatch(missing,/data-energy-history-host/);
let config=null;
const host={dataset:{entityId:entity,hoursToShow:'24',historyKind:'solar'},firstElementChild:null,isConnected:true,replaceChildren(card){this.card=card}};
context.window.loadCardHelpers=async()=>({createCardElement:async c=>(config=c,{hass:null})});
(async()=>{
  await history.mountEnergyHistoryGraphs.call({view:'solar',shadowRoot:{querySelector:()=>host},_hass:{states:{[entity]:{state:'0'}}}});
  assert.equal(config.type,'history-graph');
  assert.equal(config.entities[0],entity);
  assert.equal(config.hours_to_show,24);
  assert.ok(host.card);
  assert.ok(app.includes('this.energyHistorySection(rt,\'solar\')'));
  assert.ok(app.includes('this.energyHistorySection(rt,\'battery\')'));
  assert.ok(app.includes('this.mountEnergyHistoryGraphs();'));
  assert.ok(app.includes('this.mountGasStatisticsGraph();'),'original Gas graph must remain');
  assert.ok(app.includes("type:'statistics-graph'") && app.includes("stat_types:['change']"),'Gas must retain daily measured change');
  for(const hero of ['overview-hero.webp','flow-hero.webp','solar-hero.webp','battery-hero.webp','consumers-hero.webp','gas-page-hero-v3.webp']) assert.ok(presentation.includes(hero),'hero art lost '+hero);
  console.log('PASS actual HA Solar/Battery history card, correct canonical entity, periods, missing/duplicate/zero and Gas preservation');
})().catch(error=>{console.error(error);process.exitCode=1;});
