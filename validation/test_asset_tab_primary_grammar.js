const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("src/app/energy-card.js","utf8");

assert.match(app,/energyAssetAreaLabel\(asset = \{\}\)/);
assert.match(app,/ha_area_name/);
assert.match(app,/area_name/);
assert.match(app,/location_name/);

const deviceStart = app.indexOf("\n    energyDeviceStatusCard(");
const deviceEnd = app.indexOf("\n    energyAssetType(", deviceStart);
const device = app.slice(deviceStart, deviceEnd);
assert.match(device,/energyDeviceArea/);
assert.match(device,/energyAssetFacts\(rt,enriched,5\)/);
assert.doesNotMatch(device,/energyDeviceConfig/);
assert.doesNotMatch(device,/>Config</);
assert.doesNotMatch(device,/>Telemetry</);

const detailsStart = app.indexOf("\n    energyAssetDetailDisclosure(");
const detailsEnd = app.indexOf("\n    energyDeviceStatusCard(", detailsStart);
const details = app.slice(detailsStart, detailsEnd);
assert.match(details,/\['Area'/);
assert.match(details,/\['Profile'/);
assert.match(details,/\['Telemetry'/);
assert.match(details,/\['Source'/);
assert.match(details,/\['Asset id'/);

const batteryStart = app.indexOf("\n    batteryChildCard(");
const batteryEnd = app.indexOf("\n    gas(rt)", batteryStart);
const battery = app.slice(batteryStart, batteryEnd);
assert.match(battery,/batteryContributorArea/);
assert.match(battery,/energyAssetDetailDisclosure\(rt,asset\)/);
assert.match(battery,/assetQuickActions\(rt,assetId,3\)/);
assert.doesNotMatch(battery,/Home Battery strategy/,"Home Battery page must not contain local strategy editor");

const consumerStart = app.indexOf("\n    consumerExplorerCard(");
const consumerEnd = app.indexOf("\n    filterAndSortConsumers(", consumerStart);
const consumer = app.slice(consumerStart, consumerEnd);
assert.match(consumer,/\['Energy needed'/);
assert.match(consumer,/\['Planned today'/);
assert.match(consumer,/\['Still to plan'/);
assert.match(consumer,/\['Connection'/);
assert.match(consumer,/energyAssetFoldStack/);
assert.match(consumer,/energyAssetDiagnostics/);
assert.doesNotMatch(consumer,/rt\.assetName\(chargerId\)/,"consumer connection identity must come from backend-published display truth");

const consumersStart = app.indexOf("\n    consumers(rt)");
const consumersEnd = app.indexOf("\n    strategies(rt)", consumersStart);
const consumers = app.slice(consumersStart, consumersEnd);
assert.doesNotMatch(consumers,/consumerPrimarySummary/);
assert.doesNotMatch(consumers,/productStoryCard\(\{ eyebrow:'Managed energy'/);
assert.match(consumers,/Managed flexible assets/);
assert.match(consumers,/domain\.consumerFacing\(\)/);

console.log("PASS asset tabs use compact primary truth with progressive details");
