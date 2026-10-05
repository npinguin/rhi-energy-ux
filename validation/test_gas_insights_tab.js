const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("src/app/energy-card.js","utf8");
const presentation = fs.readFileSync("src/app/presentation.js","utf8");
const catalog = fs.readFileSync("src/app/energy-asset-catalog.js","utf8");

assert.match(presentation,/id:"consumers", labelKey:"nav\.consumption", fallback:"Consumption"[\s\S]*id:"gas", labelKey:"nav\.gas", fallback:"Gas", view:"gas"/);
assert.ok(presentation.includes('gas: "heroes/gas-page-hero-v3.webp"'),"Gas page hero mapping must use approved photographic v3 asset");
assert.ok(fs.existsSync("src/assets/heroes/gas-page-hero-v3.webp"),"missing approved Gas page hero v3 artwork");

assert.match(app,/gas:\['energy','gas'\]/);
assert.match(app,/this\.view === 'gas' \? this\.gas\(rt\)/);
assert.match(app,/gasModel\(rt\)/);
assert.match(app,/rt\.gasStatisticsEntityId\(String\(asset\?\.asset_id \|\| ''\)\)/);
assert.doesNotMatch(app,/gasTotalEntityId\(\)/);
assert.doesNotMatch(app,/logical_object_class[\s\S]{0,200}gas\.total_m3/);
assert.match(app,/hui-statistics-graph-card/);
assert.match(app,/stat_types:\['change'\]/);
assert.match(app,/period:'day'/);
assert.match(app,/days_to_show:\(\{week:7,month:30,quarter:90,year:365\}/);
assert.match(app,/data-gas-horizon/);
for (const horizon of ["week","month","quarter","year"]) assert.ok(app.includes(`['${horizon}'`) || app.includes(`'${horizon}'`), "missing Gas horizon "+horizon);
assert.match(app,/Gas usage history/);
assert.match(app,/Home Assistant history/);
assert.match(app,/No measured gas history yet/);
assert.match(app,/Connect your gas meter/);
assert.match(app,/Missing consumption is never estimated/);

assert.match(app,/energyDeviceStatusCard\(rt, gas\.asset, 'Gas meter'\)/);
assert.match(app,/gas: \{ image:hbEnergyHeroAsset\('gas'\)/);
assert.ok(catalog.includes('gas_meter.flonidan_uniflo_g4') && catalog.includes('package_path:"energy/flonidan_uniflo_g4srtv.webp"'),"Gas meter physical catalog must use the approved FLONIDAN product visual");
assert.doesNotMatch(catalog,/heroes\//,"dashboard hero artwork must not appear in the physical asset catalog");

const gasStart = app.indexOf("\n    gas(rt)");
const gasEnd = app.indexOf("\n    battery(rt)", gasStart);
const gasMethod = app.slice(gasStart, gasEnd);
assert.ok(gasMethod.indexOf('${setupOrMeter}') < gasMethod.indexOf('${graph}'), "Gas primary meter must render before history");

console.log("PASS Gas is the final Energy tab with dedicated hero, canonical meter and HA-native statistics history");

assert.match(app,/async mountGasStatisticsGraph\(\)/);
assert.match(app,/window\.loadCardHelpers/);
assert.match(app,/helpers\.createCardElement/);
assert.match(app,/type === 'energy_system' \|\| target === 'energy' \|\| target === 'energy_system'/);
assert.doesNotMatch(app,/tab === 'gas'\) return !!target && type === 'gas_meter'/);
