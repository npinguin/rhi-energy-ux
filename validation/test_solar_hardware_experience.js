const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("src/app/energy-card.js","utf8");
const catalog = fs.readFileSync("src/app/energy-asset-catalog.js","utf8");

assert.match(app,/solarEnergyStory\(rt\)/);
assert.match(app,/solarValueFlow/);
assert.match(app,/solarHardwareExperience\(rt\)/);
assert.match(app,/Solar Production/);
assert.match(app,/solarProductionHierarchy/);
assert.match(app,/Home Battery/);
assert.match(app,/solar_array/);
assert.match(app,/optimizersFor/);
assert.match(app,/solarTopologyDetails/);
assert.match(app,/solarModuleCard/);
assert.match(app,/solarOptimizerPrimaryCard/);
assert.match(app,/OPTIMIZER \/ PANEL/);
assert.match(app,/solar_optimizer\.power_w/);
assert.match(app,/solar_optimizer\.energy_kwh/);
assert.match(app,/solar_optimizer\.status/);
assert.match(app,/solar_zone\.energy_kwh/);
assert.match(app,/Lifetime energy/);
assert.doesNotMatch(app,/optimizer\.energy_today_kwh/);
assert.doesNotMatch(app,/No panels linked to this zone/);
assert.doesNotMatch(app,/No modules linked/);
assert.doesNotMatch(app,/solarOperationalExecutionPanel\(rt/);
assert.match(app,/energyDeviceStatusCard/);
assert.match(app,/energyAssetFacts/);
assert.match(app,/this\.assetVisual\(enriched/);

const hierarchyStart = app.indexOf("\n    solarHardwareExperience(rt)");
const hierarchyEnd = app.indexOf("\n    solarEnergyStory(rt)", hierarchyStart);
const hierarchy = app.slice(hierarchyStart, hierarchyEnd);
assert.match(app,/solarStringLink/);
assert.match(app,/solarInverterCard/);
assert.match(hierarchy,/stringsForInverter/);
assert.match(hierarchy,/unassignedArrays/);
assert.doesNotMatch(hierarchy,/const zoneCards = arrays\.map/);
assert.doesNotMatch(hierarchy,/'Solar zones'/);
assert.match(app,/SOLAR ZONE \/ STRING/);
assert.match(app,/data-solar-string/);

for (const id of [
  "battery.byd_lvs_20",
  "battery.solaredge_home_48v",
  "battery.huawei_luna2000_15_s0",
  "solar_zone.generic",
  "solar_panel.sunpower_x21_335_blk",
  "solar_panel.jinkosolar_jkm435n_54hl4r",
  "solar_inverter.solaredge_rwb_10k",
  "solar_inverter.solaredge_rws_8k",
  "solar_optimizer.solaredge_s500b",
  "backup_interface.solaredge_3phase",
  "gas_meter.flonidan_uniflo_g4",
  "grid_meter.sagemcom_t211_d3"
]) assert.ok(catalog.includes(id), `missing physical catalog entry ${id}`);

assert.ok(!catalog.includes("grid_connection.homewizard_p1"), "logical grid_connection must not own a product image");
assert.doesNotMatch(catalog,/heroes\//);

assert.match(app,/object-fit:contain/);
assert.match(app,/object-position:center/);

console.log("PASS Solar hardware experience with physical-only image catalog");

assert.doesNotMatch(app,/Solar energy facts/);
assert.doesNotMatch(app,/Other published hardware/);
assert.match(app,/energyAppearanceAction/);
