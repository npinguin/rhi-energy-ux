const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("src/app/energy-card.js","utf8");
const presentation = fs.readFileSync("src/app/presentation.js","utf8");
const readme = fs.readFileSync("README.md","utf8");

const runtime = app + "\n" + presentation;

// Energy capability navigation is internal card state. A Lovelace dashboard root
// is deployment configuration and must never become frontend semantic state.
assert.doesNotMatch(runtime, /\/mobility-supervisor|\/robotix-energy|\/energy\/overview|dashboard_path/);
assert.doesNotMatch(runtime, /window\.location\.pathname|location\.pathname|dashboard_path/);
const pushStateUses = runtime.match(/history\.pushState/g) || [];
assert.equal(pushStateUses.length, 1, "only the explicit cross-domain source-asset navigation may touch browser history");
assert.match(app, /data-source-asset-nav[\s\S]*history\.pushState\(null, '', path\)[\s\S]*location-changed/);

// HACS package resources are intentionally root-absolute, so changing the
// Lovelace dashboard URL cannot turn assets into relative dashboard requests.
assert.match(runtime, /\/hacsfiles\/rhi-energy-ux\/assets\//);
assert.match(readme, /dashboard URL is your deployment choice/);
assert.match(readme, /generated view path such as `0`/);
assert.match(readme, /No `dashboard_path` setting is required/);
assert.doesNotMatch(readme, /dashboard URL.*must remain|dashboard path.*must remain/i);

console.log("PASS Energy dashboard mounting is URL-independent");
