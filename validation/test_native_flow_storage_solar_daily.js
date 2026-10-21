const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const code = fs.readFileSync('src/app/energy-card.js','utf8');
function method(begin, end, context) {
  const i = code.indexOf('\n    '+begin);
  const j = code.indexOf('\n    '+end, i+begin.length+5);
  assert.ok(i>=0 && j>i, 'extract method '+begin);
  return vm.runInNewContext('({'+code.slice(i,j)+'})',context)[begin.slice(0,begin.indexOf('('))];
}
const common = {
  objectFrom: value => value && typeof value === 'object' ? value : {},
  firstDefined: (...xs) => xs.find(x => x !== null && x !== undefined),
  asNumber: value => value === null || value === undefined || value === ''
    || !Number.isFinite(Number(value)) ? null : Number(value),
  fmtKw: value => Number(value).toFixed(1)+' kW',
  escapeHtml: value => String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;'),
};
const solar = method('solarTodayMeasurement(rt) {','buildPageViewModel(rt, tab) {',common);
const rt = (periods, direct=null) => ({
  meteringPeriods:()=>periods,
  number:key=>key === 'solar.energy_today_kwh' ? direct : null,
});
const period=(solar_kwh,quality)=>[{period_id:'today',
  summary:{measured:{solar_kwh},quality:{field_quality:{solar_kwh:quality}}},
  field_quality:{solar_kwh:quality}}];
assert.equal(solar(rt(period(4.56,'OK'))).value,4.56,'native daily production is authoritative');
assert.equal(solar(rt(period(2.1,'PARTIAL'))).quality,'PARTIAL','partial evidence is labelled');
assert.equal(solar(rt(period(9.9,'UNKNOWN'))).value,null,'no unqualified day values');
assert.equal(solar(rt([],3.7)).value,3.7,'inverter-owned day kWh is valid fallback');
assert.equal(solar(rt([])).value,null,'no invention from instantaneous solar kW');
assert.equal(solar(rt(period(null,'OK'))).value,null,'null is not measured zero');
const diagram = method('nativeFlowDiagram(current, physicalFlow) {','nativeFlowEvidence(current, physicalFlow) {',common);
const current = {
  solar:{powerKw:0.9},
  grid:{direction:'importing',importPowerKw:1.5,exportPowerKw:0},
  battery:{direction:'into_storage',chargePowerKw:0.6,dischargePowerKw:0}
};
const result=diagram.call({},current,{siteConsumptionKw:2.4,homeConsumptionKw:1.8,flexibleLoadsKw:0});
assert.match(result,/data-rhi-native-flow-diagram/);
assert.match(result,/Solar production/);
assert.match(result,/Grid import/);
assert.match(result,/Home consumption/);
assert.match(result,/Home Battery charging/);
assert.match(result,/2.4 kW/);
assert.doesNotMatch(result,/Grid export/, 'never infer export while importing');
assert.doesNotMatch(result,/Battery discharge/, 'never infer discharge while charging');
assert.doesNotMatch(diagram.call({}, {...current,battery:{direction:'unknown',chargePowerKw:null,dischargePowerKw:null}}, {siteConsumptionKw:2.4,homeConsumptionKw:1.8,flexibleLoadsKw:0}),/Home Battery charging/);
const overviewStart=code.indexOf('    overview(rt) {');
const overviewEnd=code.indexOf('    commandForLoad(',overviewStart);
const overview=code.slice(overviewStart,overviewEnd);
assert.ok(overview.includes('<div class="overviewRightStack"><section'), 'Consumption column owns separate stack');
assert.ok(overview.includes('</section>${batteryChargeRow}</div>'), 'storage charging only in separate panel');
assert.ok(!overview.includes('${contributorRows}${batteryChargeRow}'), 'battery must not be a Home Consumption child');
assert.ok(overview.includes("balanceVm.battery.direction === 'into_storage'"), 'show charge only for trusted direction');
assert.ok(overview.includes("balanceVm.batteryChargeKw > 0.05"), 'no charge row for idle battery');
const flowStart=code.indexOf('    renderFlowContent(rt) {');
const flowEnd=code.indexOf('    propertyRow(',flowStart);
const flow=code.slice(flowStart,flowEnd);
assert.ok(flow.includes('this.nativeFlowDiagram(current, physicalFlow)'), 'first-party Flow is always primary');
assert.ok(flow.indexOf('this.nativeFlowDiagram(current, physicalFlow)') < flow.indexOf('this.powerFlowDependencyNotice()'), 'optional card cannot block Flow');
assert.ok(flow.includes('<details class="rhiOptionalPowerFlow">'), 'external dependency is progressive detail');
const fallback=code.slice(code.indexOf('    flow(rt) {'),flowStart);
assert.ok(fallback.includes('this.nativeFlowDiagram(current, consumption)'), 'render failure still shows native diagram');
console.log('PASS native first-party Flow, separate storage demand, producer-owned solar daily metering');

