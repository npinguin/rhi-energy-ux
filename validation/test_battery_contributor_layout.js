const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("src/app/energy-card.js","utf8");

assert.match(app,/batteryContributorVisual \.assetVisual\{width:88px!important;height:108px!important/);
assert.match(app,/batteryContributorVisual \.assetVisual img\{[^}]*object-fit:contain!important[^}]*object-position:center center!important/);
assert.match(app,/batteryContributorCard\{[^}]*max-height:156px/);
assert.match(app,/@media\(max-width:700px\)[\s\S]*batteryContributorVisual \.assetVisual\{width:68px!important;height:88px!important/);

// Body-only correction: the Home Battery hero contract remains unchanged.
assert.match(app,/battery: \{ image:hbEnergyHeroAsset\('battery'\), icon:'▣', eyebrow:'Home Battery', title:batteryState/);
assert.match(app,/image:hbEnergyHeroAsset\('battery'\)/);

console.log("PASS Home Battery body contributor sizing and hero preservation");
