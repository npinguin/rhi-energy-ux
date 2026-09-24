const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("src/app/energy-card.js","utf8");
const catalog = fs.readFileSync("src/app/energy-asset-catalog.js","utf8");

const method = name => {
  const start = app.indexOf("\n    "+name+"(");
  assert.ok(start >= 0, "missing "+name);
  const next = app.indexOf("\n    ", start + 6);
  return app.slice(start, next > start ? next : app.length);
};

const flow = method("flow");
const planning = method("planning");
const solar = method("solar");

assert.doesNotMatch(flow,/Physical energy devices|energyHardwareCards|solarHardwareExperience/);
assert.doesNotMatch(planning,/Physical energy devices|energyHardwareCards|solarHardwareExperience|Solar support devices/);
assert.match(solar,/solarEnergyStory/);
assert.match(solar,/solarHardwareExperience/);
assert.doesNotMatch(solar,/solarOperationalExecutionPanel/);

for (const phrase of ["Solar arrays","Inverter system","Battery system","Solar support devices"]) {
  assert.ok(app.includes(phrase), "missing Solar hierarchy section "+phrase);
}
assert.match(app,/energyAssetParentId/);
assert.match(app,/Aggregate storage state with the physical batteries shown underneath/);
assert.match(catalog,/solar_production\.sunpower_x21_335_blk/);
assert.match(catalog,/solar_production\.jinkosolar_jkm435n_54hl4r/);

const requiredArtwork = [
  "solaredge_backup_interface_3phase.webp",
  "solaredge_s500b_optimizer.webp"
];
for (const file of requiredArtwork) {
  assert.ok(fs.existsSync("src/assets/energy/"+file), "missing verified artwork "+file);
}
console.log("PASS Solar owns hardware hierarchy; Flow and Planning stay clean");
