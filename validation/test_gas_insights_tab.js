const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("src/app/energy-card.js","utf8");
const presentation = fs.readFileSync("src/app/presentation.js","utf8");
const catalog = fs.readFileSync("src/app/energy-asset-catalog.js","utf8");

assert.match(presentation,/id:"consumers", label:"Consumers"[\s\S]*id:"gas", label:"Gas", view:"gas"/);
assert.ok(presentation.includes('gas: "heroes/gas-hero.webp"'),"Gas hero mapping must use WebP");
assert.ok(fs.existsSync("src/assets/heroes/gas-hero.webp"),"missing Gas hero artwork");

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
assert.match(app,/Meter context/);
assert.match(app,/gasContextGrid/);
assert.match(app,/Total entity/);
assert.match(app,/No measured gas history yet/);
assert.match(app,/Connect your gas meter/);
assert.match(app,/The UX never estimates missing consumption/);

assert.match(app,/energyDeviceStatusCard\(rt, gas\.asset, 'Gas meter'\)/);
assert.match(app,/gas: \{ image:hbEnergyHeroAsset\('gas'\)/);
assert.ok(catalog.includes('gas_meter.smart_meter') && catalog.includes('package_path:"heroes/gas-hero.webp"'),"Gas catalog must reference WebP hero");

console.log("PASS Gas is the final Energy tab with dedicated hero, canonical meter and HA-native statistics history");
