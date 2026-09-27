const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("src/app/energy-card.js","utf8");
const presentation = fs.readFileSync("src/app/presentation.js","utf8");
const catalog = fs.readFileSync("src/app/energy-asset-catalog.js","utf8");

assert.match(presentation,/id:"consumers", label:"Consumers"[\s\S]*id:"gas", label:"Gas", view:"gas"/);
assert.ok(presentation.includes('gas: "heroes/gas-page-hero-v3.webp"'),"Gas page hero mapping must use approved photographic v3 asset");
assert.ok(fs.existsSync("src/assets/heroes/gas-page-hero-v3.webp"),"missing approved Gas page hero v3 artwork");

assert.match(app,/gas:\['consumer'\]/);
assert.match(app,/gas:\['energy','gas'\]/);
assert.match(app,/this\.view === 'gas' \? this\.gas\(rt\)/);
assert.match(app,/gasModel\(rt\)/);
assert.match(app,/gasTotalEntityId\(\)/);
assert.match(app,/hui-statistics-graph-card/);
assert.match(app,/stat_types:\['change'\]/);
assert.match(app,/period:'day'/);
assert.match(app,/days_to_show:30/);
assert.match(app,/Gas usage history/);
assert.match(app,/Home Assistant long-term statistics/);
assert.match(app,/No measured gas history yet/);
assert.match(app,/Connect your gas meter/);
assert.match(app,/The UX never estimates missing consumption/);

const gasStart=app.indexOf('\n    gas(rt) {');
const gasEnd=app.indexOf('\n    battery(rt)',gasStart);
const gas=app.slice(gasStart,gasEnd);
assert.ok(gas.indexOf('${setupOrMeter}') < gas.indexOf('${graph}'),"Gas meter card must be rendered directly before HA history");
assert.doesNotMatch(gas,/Meter context/);
assert.doesNotMatch(gas,/gasContextGrid/);

assert.match(app,/energyDeviceStatusCard\(rt, gas\.asset, 'Gas meter'\)/);
assert.match(app,/gas: \{ image:hbEnergyHeroAsset\('gas'\)/);
assert.ok(catalog.includes('gas_meter.smart_meter') && catalog.includes('package_path:"heroes/gas-hero.webp"'),"Gas meter catalog fallback may retain the logical-device WebP visual");

console.log("PASS Gas meter card precedes HA-native statistics history");
