const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('src/app/energy-card.js','utf8');
const localeSource = fs.readFileSync('src/app/localization.js','utf8');
const begin = source.indexOf('\n    nativeFlowEvidence(');
const end = source.indexOf('\n    powerFlowDependencyStatus(', begin + 1);
assert.ok(begin > 0 && end > begin, 'native source-backed fallback method');
const safe = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;');
const namespace = {
  rhiEnergyT:(_hass,_key,_params,fallback)=>fallback,
  escapeHtml:safe,
  asNumber:value=>(value === null || value === undefined || value === '' ||
    typeof value === 'boolean' || !Number.isFinite(Number(value))) ? null : Number(value),
  fmtKw:value=>Number(value).toFixed(2)+' kW'
};
const renderer = vm.runInNewContext('({'+source.slice(begin,end)+'})', namespace).nativeFlowEvidence;
const facts = {
  solar:{powerKw:0}, grid:{importPowerKw:1.2,exportPowerKw:null},
  battery:{valueAvailable:false,displayPowerKw:5}
};
const physical = {siteConsumptionKw:2.3,homeConsumptionKw:1.1,flexibleLoadsKw:null,connectionPowerKw:7};
const markup=renderer.call({_hass:null},facts,physical);
assert.match(markup,/data-rhi-native-flow/);
assert.match(markup,/Solar production/);
assert.match(markup,/0\.00 kW/,'true measured zero remains visible');
assert.match(markup,/1\.20 kW/);
assert.match(markup,/2\.30 kW/);
assert.match(markup,/Not available/,'missing grid/export/flex/battery remains unknown');
assert.doesNotMatch(markup,/7\.00 kW/,'physical charger is not counted again');
assert.doesNotMatch(markup,/5\.00 kW/,'unknown battery direction cannot be animated');
assert.ok(source.includes('${this.nativeFlowEvidence(current, physicalFlow)}'));
assert.ok(source.includes("hasAttribute('data-rhi-native-flow')"));
assert.ok(source.includes('host.replaceChildren(card)'));
assert.ok(!source.includes("host.innerHTML = '<div class=\"empty compact\"><b>Power Flow Card Plus could not render"));
for(const key of ['flow.native_title','flow.native_desc','flow.native_solar','flow.native_grid_import','flow.native_grid_export','flow.native_site','flow.native_home','flow.native_flexible','flow.native_battery']){
  const count=(localeSource.match(new RegExp('\"'+key.replaceAll('.','\\.')+'\"','g'))||[]).length;
  assert.equal(count,3,key+' must be present in EN/NL/FR');
}
console.log('PASS source-backed responsive Flow fallback, missing/zero/battery safety, optional-card resilience and EN/NL/FR');
