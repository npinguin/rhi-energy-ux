const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("src/app/energy-card.js","utf8");

assert.match(app,/batteryContributorVisual \.assetVisual\{width:88px!important;height:108px!important/);
assert.match(app,/batteryContributorVisual \.assetVisual img\{[^}]*object-fit:contain!important[^}]*object-position:center center!important/);
assert.match(app,/batteryContributorCard\{[^}]*min-height:148px/);
assert.doesNotMatch(app,/batteryContributorCard\{[^}]*max-height:/);
assert.match(app,/@media\(max-width:700px\)[\s\S]*batteryContributorVisual \.assetVisual\{width:68px!important;height:88px!important/);
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
