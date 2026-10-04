const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("src/app/energy-card.js","utf8");

assert.match(app,/batteryContributorVisual \.assetVisual\{width:88px;height:108px/);
assert.match(app,/batteryContributorVisual \.assetVisual img\{[^}]*object-fit:contain[^}]*object-position:center center/);
assert.match(app,/batteryContributorCard\{[^}]*min-height:148px/);
assert.doesNotMatch(app,/batteryContributorCard\{[^}]*max-height:/);
assert.match(app,/@media\(max-width:700px\)[\s\S]*batteryContributorVisual \.assetVisual\{width:68px;height:88px/);
assert.match(app,/batteryContributorFacts\{display:grid/);
assert.match(app,/energyAssetQuickActions/);

// Body-only correction: the Home Battery hero contract remains unchanged.
assert.match(app,/battery: \{ image:hbEnergyHeroAsset\('battery'\), icon:'▣', eyebrow:'Home Battery', title:batteryState/);
assert.match(app,/image:hbEnergyHeroAsset\('battery'\)/);


// Canonical multi-object access: contributor discovery starts at the published
// battery_system parent and duplicate battery.* property keys stay asset-scoped.
assert.match(app,/const batterySystem = rt\.assets\(\)\.find\(/);
assert.match(app,/rt\.childrenOfType\(String\(batterySystem\.asset_id \|\| 'battery_system'\), 'battery'\)/);
assert.match(app,/rt\.assetNumber\(assetId, 'battery\.soc_pct'\)/);
assert.match(app,/rt\.assetNumber\(assetId, 'battery\.power_kw'\)/);
assert.match(app,/rt\.assetText\(assetId, 'battery\.state'/);
assert.doesNotMatch(app,/containsChildren\('battery'\)/);
assert.doesNotMatch(app,/rt\.number\(\`\$\{assetId\}\.soc_pct\`\)/);

console.log("PASS Home Battery contributor layout + canonical multi-object access");

assert.match(app,/Measurements limited/);
assert.match(app,/Battery is available; per-battery power is not available/);
assert.doesNotMatch(app,/power === null \? 'Unavailable'/);
assert.match(app,/const explicitlyUnavailable = \/unavailable\|offline\|disconnected\|failed/);
