const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("src/app/energy-card.js","utf8");
const presentation = fs.readFileSync("src/app/presentation.js","utf8");
const catalog = fs.readFileSync("src/app/energy-asset-catalog.js","utf8");

const method = name => {
  const sig = "\n    " + name + "(";
  const start = app.indexOf(sig);
  assert.ok(start >= 0, "missing method " + name);
  const signatureEnd = app.indexOf(") {", start);
  assert.ok(signatureEnd >= 0, "missing method body " + name);
  const open = signatureEnd + 2;
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

assert.match(presentation, /id:"solar", labelKey:"nav\.solar", fallback:"Solar", view:"solar"/);
assert.match(presentation, /id:"plan", labelKey:"nav\.plan", fallback:"Plan", view:"planning"/);
assert.doesNotMatch(presentation, /id:"operational-planning", labelKey:"nav\.operational_plan"/);
assert.match(app, /\['operational-planning','planning','strategic-planning'\]\.includes\(tab\)/);

const solar = method("solar");
assert.match(solar, /solarEnergyStory\(rt\)/);
assert.match(solar, /solarHardwareExperience\(rt\)/);

const operational = method("operationalPlanning");
assert.match(operational, /operationalLoadCard/);

for (const [name, token] of [
  ["operationalLoadCard", /this\.assetVisual\(load/],
  ["consumerExplorerCard", /this\.assetVisual\(asset/],
  ["batteryChildCard", /this\.assetVisual\(asset/],
  ["effectivePolicyPreviewCard", /this\.assetVisual\(asset/],
  ["flexibleLoadMeteringTable", /this\.assetVisual\(asset/],
]) {
  assert.match(method(name), token);
}

assert.match(catalog, /solar_inverter\.solaredge_rwb_10k[\s\S]*package_path:"energy\/solaredge_rwb_10k\.webp"/);
assert.ok(fs.existsSync("src/assets/energy/solaredge_rwb_10k.webp"), "missing approved RWB WebP");
assert.doesNotMatch(catalog, /heroes\//);

console.log("PASS tab ownership and physical asset visuals without dashboard-hero fallback");
