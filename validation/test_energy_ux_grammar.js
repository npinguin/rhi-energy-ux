const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("src/app/energy-card.js","utf8");
const header = fs.readFileSync("src/ui/components/page-header.js","utf8");
const presentation = fs.readFileSync("src/app/presentation.js","utf8");
const catalog = fs.readFileSync("src/app/energy-asset-catalog.js","utf8");
const core = fs.readFileSync("src/vendor/rhi-ux-core.js","utf8");

for (const token of [
  'id:"overview", label:"Overview"',
  'id:"flow", label:"Flow"',
  'id:"solar", label:"Solar"',
  'id:"battery", label:"Home Battery"',
  'id:"consumers", label:"Consumers"',
  'id:"gas", label:"Gas"',
  'id:"strategy", label:"Strategy"',
  'id:"operational-planning", label:"Operational Planning"',
  'id:"tactical-planning", label:"Tactical Planning"',
  'id:"strategic-planning", label:"Strategic Planning"',
  'id:"metering", label:"Metering"',
  'id:"value", label:"Value"',
  'id:"retrospective", label:"Retrospective"'
]) assert.ok(presentation.includes(token), "missing existing tab "+token);

assert.match(header,/metrics = \[\], quickActions = ""/);
assert.match(header,/rhiUxQuickActionBar/);
assert.match(header,/rhiEnergyPageHeader rhiUxPageStack/);
assert.match(core,/\.rhiUxPageStack>\.rhiUxPageHero\{order:1\}/);
assert.match(core,/\.rhiUxPageStack>\.rhiUxStatusGrid\{order:2\}/);
assert.match(core,/\.rhiUxPageStack>\.rhiUxQuickActionBar\{order:3\}/);
assert.match(app,/quickActions:this\.pageQuickActions\(rt, tab\)/);
assert.match(app,/pageQuickActions\(rt, tab\)/);
assert.match(app,/rt\.visibleCommands\(\)/);
assert.match(app,/createCommandActionModel\(command\)/);
assert.match(app,/assetQuickActions\(rt, assetId/);
assert.match(app,/rt\.commandActionModelsForAsset\(id\)/);

const start = app.indexOf("\n    energyAssetFacts(");
const end = app.indexOf("\n    energyDeviceStatusCard(", start);
assert.ok(start > 0 && end > start, "energyAssetFacts method missing");
const facts = app.slice(start,end);
assert.match(facts,/rt\.assetField\(id, key\)/);
assert.doesNotMatch(facts,/rowsByAsset/);
assert.doesNotMatch(app,/rawText\([^\n]*\.health/);

assert.match(app,/battery\.available_kwh/);
assert.match(app,/battery\.capacity_kwh/);
assert.match(app,/batteryContributorFacts/);
assert.match(app,/this\.assetQuickActions\(rt,assetId,3\)/);

for (const token of [
  "flexible_asset.generic",
  "consumer.generic",
  "solar_array.generic",
  "inverter.generic",
  "site_consumption.home",
  "energy_system.home"
]) assert.ok(catalog.includes(token), "missing representative visual fallback "+token);

assert.match(app,/@media\(max-width:1100px\)/);
assert.match(app,/@media\(max-width:720px\)/);
assert.match(core,/@media\(max-width:760px\)/);
assert.match(core,/@media\(max-width:430px\)/);
assert.match(core,/\.rhiUxPageHeroArt\{position:absolute/);
assert.match(core,/\.rhiUxStatusGrid\{/);
assert.match(core,/\.rhiUxQuickActionBar/);
assert.match(core,/--rhi-font-family:/);
assert.doesNotMatch(presentation,/\.rhiUxPageHero\s*\{/);
assert.doesNotMatch(presentation,/\.rhiUxStatusGrid\s*\{/);
assert.doesNotMatch(presentation,/\.rhiUxQuickActionBar\s*\{/);
assert.match(app,/object-fit:contain/);
assert.ok(app.includes('rhiUxDomainShell({'));
assert.match(app,/domain:'ENERGIE'/);
assert.match(app,/data-rhi-module/);
assert.match(app,/data-rhi-item/);

console.log("PASS Energy canonical page/asset grammar, quick commands, visuals and responsive coverage");
