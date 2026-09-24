const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("src/app/energy-card.js","utf8");
const catalog = fs.readFileSync("src/app/energy-asset-catalog.js","utf8");

assert.match(app,/solarEnergyStory\(rt\)/);
assert.match(app,/What is happening with my solar\?/);
assert.match(app,/Panel<\/span><i>→<\/i><span>Inverter<\/span><i>→<\/i><span>Home Bus/);
assert.match(app,/Exact solar-versus-grid charge allocation is not separately published/);
assert.match(app,/the UX does not invent how much charge came from solar versus grid/);

assert.match(app,/energyHardwareCards\(rt,\['solar_panel','solar_production','solar_inverter','battery','battery_system'\]/);
assert.match(app,/Your solar system/);
assert.match(app,/energyDeviceStatusCard/);
assert.match(app,/energyAssetFacts/);
assert.match(app,/this\.assetVisual\(enriched/);
assert.match(app,/this\.assetVisual\(asset,\{size:'lg',fallbackIcon:'▣'/);

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

console.log("PASS Solar hardware experience: facts + visuals + measured-flow Q&A");
