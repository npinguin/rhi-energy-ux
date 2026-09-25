const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("src/app/energy-card.js","utf8");
const presentation = fs.readFileSync("src/app/presentation.js","utf8");
const catalog = fs.readFileSync("src/app/energy-asset-catalog.js","utf8");

assert.match(presentation,/id:"consumers", label:"Consumers"[\s\S]*id:"gas", label:"Gas", view:"gas"/);
assert.match(presentation,/gas: "heroes\/gas-hero\.svg"/);
assert.ok(fs.existsSync("src/assets/heroes/gas-hero.svg"),"missing Gas hero artwork");

assert.match(app,/gas:\['consumer'\]/);
assert.match(app,/gas:\['energy','gas'\]/);
assert.match(app,/this\.view === 'gas' \? this\.gas\(rt\)/);
assert.match(app,/gasModel\(rt\)/);
assert.match(app,/gasTotalEntityId\(\)/);
assert.match(app,/hui-statistics-graph-card/);
assert.match(app,/stat_types:\['change'\]/);
assert.match(app,/period:'day'/);
assert.match(app,/days_to_show:30/);
assert.match(app,/Gas consumption history/);
assert.match(app,/Native Home Assistant long-term statistics/);
assert.match(app,/energyDeviceStatusCard\(rt, gas\.asset, 'Gas meter'\)/);
assert.match(app,/gas: \{ image:hbEnergyHeroAsset\('gas'\)/);
assert.match(catalog,/gas_meter\.smart_meter[\s\S]*package_path:"heroes\/gas-hero\.svg"/);

console.log("PASS Gas is the final Energy tab with dedicated hero, canonical meter and HA-native statistics history");
