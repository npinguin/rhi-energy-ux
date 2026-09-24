const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("src/app/energy-card.js","utf8");
const presentation = fs.readFileSync("src/app/presentation.js","utf8");
const catalog = fs.readFileSync("src/app/energy-asset-catalog.js","utf8");

const method = name => {
  const sig = "\n    " + name + "(";
  const start = app.indexOf(sig);
  assert.ok(start >= 0, "missing method " + name);
  const open = app.indexOf("{", start);
  let depth = 0, quote = null, escaped = false;
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
    if (ch === "}" && --depth === 0) return app.slice(start, i + 1);
  }
  throw new Error("unterminated method " + name);
};

assert.match(presentation, /id:"solar", label:"Solar", view:"solar"/);
assert.match(presentation, /id:"operational-planning", label:"Operational Planning", view:"operational-planning"/);
assert.doesNotMatch(presentation, /id:"solar", label:"Solar", view:"solar-generation"/);
assert.doesNotMatch(presentation, /id:"operational-planning", label:"Operational Planning", view:"solar"/);

const viewContent = method("viewContent");
assert.match(viewContent, /this\.view === 'solar' \? this\.solar\(rt\)/);
assert.match(viewContent, /this\.view === 'operational-planning' \? this\.operationalPlanning\(rt\)/);

const solar = method("solar");
assert.match(solar, /solarEnergyStory\(rt\)/);
assert.match(solar, /solarHardwareExperience\(rt\)/);
assert.match(solar, /Solar energy facts/);
assert.doesNotMatch(solar, /operationalLoadCard/);
assert.doesNotMatch(solar, /Flexible Loads/);
assert.doesNotMatch(solar, /requested_charge_power/);

const operational = method("operationalPlanning");
assert.match(operational, /operationalLoadCard/);
assert.match(operational, /Flexible loads/);
assert.match(operational, /Current execution, next action, requested power and operational reason/);
assert.doesNotMatch(operational, /solarHardwareExperience/);
assert.doesNotMatch(operational, /Solar arrays/);
assert.doesNotMatch(operational, /Inverter system/);
assert.doesNotMatch(operational, /Battery system/);

const operationalCard = method("operationalLoadCard");
assert.match(operationalCard, /this\.assetVisual\(load/);

const consumers = method("consumerExplorerCard");
assert.match(consumers, /this\.assetVisual\(asset/);

const overview = method("overview");
assert.match(overview, /asset:row\.raw/);

const planning = method("planning");
assert.match(planning, /this\.assetVisual\(item\.asset/);

const connector = method("connectorCard");
assert.match(connector, /resolveEnergyVisualRef\(charger\.visual_ref\)/);
const flowConsumer = method("consumerCard");
assert.match(flowConsumer, /resolveEnergyVisualRef\(consumer\.visual_ref\)/);

const battery = method("batteryChildCard");
assert.match(battery, /this\.assetVisual\(asset/);

const strategy = method("strategies");
assert.match(strategy, /strategyAssetIdentity/);
const policy = method("effectivePolicyPreviewCard");
assert.match(policy, /this\.assetVisual\(asset/);

const metering = method("flexibleLoadMeteringTable");
assert.match(metering, /meteringAssetIdentity/);
assert.match(metering, /this\.assetVisual\(asset/);

const value = method("value");
assert.match(value, /this\.assetVisual\(identity\.asset/);
assert.match(value, /this\.assetVisual\(asset/);

assert.match(catalog, /solar_inverter\.solaredge_rwb_10k[\s\S]*package_path:"energy\/solaredge_rwb_10k\.svg"/);
assert.ok(fs.existsSync("src/assets/energy/solaredge_rwb_10k.svg"), "missing crisp RWB SVG");
assert.ok(!fs.existsSync("src/assets/energy/solaredge_rwb_10k.webp"), "blurred RWB raster must be removed");

console.log("PASS tab ownership, device visual coverage and crisp SE10K RWB artwork");
