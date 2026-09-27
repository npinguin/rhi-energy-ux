const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("src/app/energy-card.js","utf8");
const catalog = fs.readFileSync("src/app/energy-asset-catalog.js","utf8");

assert.match(app,/solarHardwareExperience\(rt\)/);
assert.match(app,/Inverter system/);
assert.match(app,/Battery system/);
assert.match(app,/Solar zones/);
assert.match(app,/solar_zone/);
assert.match(app,/solarZoneCard\(rt/);
assert.match(app,/solarModuleCard\(rt/);
assert.match(app,/PANEL \+ OPTIMIZER/);
assert.match(app,/optimizer telemetry is the technical interface/i);
assert.match(app,/Unassigned published hardware/);
assert.match(app,/Primary storage truth and hierarchy only/);
assert.match(app,/Policies and controls remain in Home Battery/);

const hardwareStart = app.indexOf('solarHardwareExperience(rt)');
const hardwareEnd = app.indexOf('\n    solarEnergyStory(rt)', hardwareStart);
const hardware = app.slice(hardwareStart, hardwareEnd);
assert.ok(hardware.indexOf('inverterSection') < hardware.indexOf('batterySection'));
assert.ok(hardware.indexOf('batterySection') < hardware.indexOf('zonesSection'));
assert.match(hardware,/return `<div class="solarHardwareExperience">\$\{inverterSection\}\$\{batterySection\}\$\{zonesSection\}/);

const solarStart = app.indexOf('\n    solar(rt) {');
const solarEnd = app.indexOf('\n    operationalPlanning(rt)', solarStart);
const solar = app.slice(solarStart, solarEnd);
assert.match(solar,/solarHardwareExperience\(rt\)/);
assert.doesNotMatch(solar,/solarEnergyStory\(rt\)/);
assert.doesNotMatch(solar,/Solar energy facts/);

assert.match(app,/energyDeviceStatusCard/);
assert.match(app,/energyAssetFacts/);
assert.match(app,/this\.assetVisual\(visualAsset,\{size:'lg',fallbackIcon:'☀',decorative:false\}/);
assert.match(app,/this\.energyAssetDetailDisclosure\(rt,optimizerAsset\)/);

for (const id of [
  "battery.byd_lvs_20",
  "battery.solaredge_home_48v_9_6",
  "solar_panel.sunpower_x21_335_blk",
  "solar_panel.jinkosolar_jkm435n_54hl4r",
  "solar_inverter.solaredge_rwb_10k",
  "solar_inverter.solaredge_rws_8k",
  "solar_optimizer.solaredge_s500b",
  "backup_interface.solaredge_3phase",
  "grid_connection.homewizard_p1"
]) assert.ok(catalog.includes(id), `missing catalog entry ${id}`);

assert.match(app,/object-fit:contain/);
assert.match(app,/object-position:center/);

console.log("PASS Solar hierarchy: inverter -> battery -> zones with panel+optimizer module cards");
