const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const core = fs.readFileSync('src/vendor/rhi-ux-core.js','utf8');
const app = fs.readFileSync('src/app/energy-card.js','utf8');
const presentation = fs.readFileSync('src/app/presentation.js','utf8');
const context = {Intl,Number,Date,String,Object,Array};
vm.createContext(context);
vm.runInContext(core,context);
const render = options => vm.runInContext('rhiUxCompactAssetRow('+JSON.stringify(options)+')',context);
const liveZero=render({name:'EV <one>',power:'0.0 kW',state:'Idle',context:'Energy needed 0.0 kWh'});
assert.match(liveZero,/EV &lt;one&gt;/);
assert.match(liveZero,/0\.0 kW/);
assert.match(liveZero,/Energy needed 0\.0 kWh/);
assert.doesNotMatch(liveZero,/data-nav/);
const link=render({name:'Vehicle',power:'—',relationshipLabel:'Assigned charger',relationshipTarget:'/mobility/?asset=a%20b'});
assert.match(link,/data-nav="\/mobility\/\?asset=a%20b"/);
const noNavigation=render({name:'Vehicle',relationshipLabel:'Assigned charger'});
assert.doesNotMatch(noNavigation,/data-nav/);
assert.ok(app.includes('rhiUxCompactAssetRow({'), 'Consumption must use Core row');
assert.ok(app.includes("rhiUxResolveDomainAssetNavigation('rhi_mobility',chargerId)"),'charger destination must come from producer registry');
assert.ok(app.includes("coreAssetNavigation.dataset.nav"),'Core relationship links must be actionable');
assert.ok(app.includes('rhiUxChartViewport') && app.includes('rhiUxChartPanel'), 'Gas uses Core chart frame');
for(const fragment of ["type:'statistics-graph'","stat_types:['change']","period:'day'","chart_type:'bar'","days_to_show:({week:7,month:30,quarter:90,year:365}"]) {
  assert.ok(app.includes(fragment), 'Gas must retain native graph contract: '+fragment);
}
for(const [tab,hero] of Object.entries({overview:'overview-hero.webp',flow:'flow-hero.webp',solar:'solar-hero.webp',battery:'battery-hero.webp',consumers:'consumers-hero.webp',gas:'gas-page-hero-v3.webp'})) {
  assert.ok(presentation.includes(tab+': "heroes/'+hero+'"'), 'Existing hero changed: '+tab);
}
assert.ok(!app.includes('const chargerTarget = chargerId ? "/'), 'Do not hardcode mobility route');
console.log('PASS Core asset row, canonical values, source-owned charger link, original heroes and HA Gas chart');
