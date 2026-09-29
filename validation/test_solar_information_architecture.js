const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("src/app/energy-card.js","utf8");
const catalog = fs.readFileSync("src/app/energy-asset-catalog.js","utf8");

const method = name => {
  const start = app.indexOf("\n    "+name+"(");
  assert.ok(start >= 0, "missing "+name);
  const open = app.indexOf("{", start);
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = open; i < app.length; i += 1) {
    const ch = app[i];
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === "\\") { escaped = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") { quote = ch; continue; }
    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return app.slice(start, i + 1);
    }
  }
  throw new Error("unterminated method "+name);
};

const flow = method("flow");
const planning = method("planning");
const solar = method("solar");

assert.doesNotMatch(flow,/Physical energy devices|energyHardwareCards|solarHardwareExperience/);
assert.doesNotMatch(planning,/Physical energy devices|energyHardwareCards|solarHardwareExperience|Solar support devices/);
assert.match(solar,/solarEnergyStory/);
assert.match(solar,/solarHardwareExperience/);
assert.doesNotMatch(solar,/solarOperationalExecutionPanel/);

for (const phrase of ["Solar Production","Home Battery"]) {
  assert.ok(app.includes(phrase), "missing Solar hierarchy section "+phrase);
}
assert.match(app,/energyAssetParentId/);
assert.match(app,/energyAssetDetailDisclosure/);
assert.match(app,/Missing publication fields/);
assert.match(app,/Storage system with its physical batteries/);
const hardwareStart = app.indexOf("\n    solarHardwareExperience(rt)");
const hardwareEnd = app.indexOf("\n    solarEnergyStory(rt)", hardwareStart);
const hardware = app.slice(hardwareStart, hardwareEnd);
assert.match(hardware,/solarHardwareExperience">\$\{batterySection\}\$\{productionSection\}/, "rendered Solar body must be Home Battery then Solar Production");
assert.match(hardware,/stringsForInverter/);
assert.match(hardware,/unassignedArrays/);
assert.doesNotMatch(hardware,/'Solar zones'/);
assert.match(app,/solarModuleCard/);
assert.match(app,/solarOptimizerPrimaryCard/);
assert.match(app,/OPTIMIZER \/ PANEL/);
assert.match(app,/SOLAR STRING/);
assert.match(app,/solarPanelOnlyGrid/);
assert.doesNotMatch(app,/No panels linked to this zone/);
assert.doesNotMatch(app,/No modules linked/);
assert.doesNotMatch(app,/Optimizers without panel relationship/);
assert.doesNotMatch(app,/summary>Panels \(/);
assert.doesNotMatch(app,/summary>Optimizers \(/);
assert.match(catalog,/solar_panel\.sunpower_x21_335_blk/);
assert.match(catalog,/solar_panel\.jinkosolar_jkm435n_54hl4r/);

const requiredArtwork = [
  "byd_lvs_20.webp",
  "solaredge_home_battery_48v_9_6.webp",
  "solaredge_rwb_10k.webp",
  "solaredge_rws_8k.webp",
  "solaredge_backup_interface_3phase.webp",
  "solaredge_s500b_optimizer.webp",
  "sunpower_spr_x21_335_blk.webp",
  "jinkosolar_jkm435n_54hl4r.webp",
  "homewizard_p1.webp"
];
for (const file of requiredArtwork) {
  assert.ok(fs.existsSync("src/assets/energy/"+file), "missing verified artwork "+file);
}
console.log("PASS Solar owns hardware hierarchy; Flow and Planning stay clean");

assert.match(app,/solarTopologyDiagnostics/);
assert.match(app,/Topology diagnostics/);
assert.doesNotMatch(app,/<details class="solarStringLink"/);
assert.match(app,/<article class="solarStringLink"/);

assert.doesNotMatch(solar,/Solar energy facts/);
assert.doesNotMatch(solar,/Other published hardware/);
assert.match(app,/energyAppearanceAction/);
assert.match(app,/data-energy-visual-open/);

assert.doesNotMatch(app,/solarHardwareSection\(\n\s*'Inverter system'/);
assert.match(app,/solarProductionHierarchy/);
assert.match(app,/Aggregate production followed by the physical inverter → string → optimizer\/panel hierarchy/);
