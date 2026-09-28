const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("src/app/energy-card.js","utf8");
const header = fs.readFileSync("src/ui/components/page-header.js","utf8");
const presentation = fs.readFileSync("src/app/presentation.js","utf8");
const catalog = fs.readFileSync("src/app/energy-asset-catalog.js","utf8");
const core = fs.readFileSync("src/vendor/rhi-ux-core.js","utf8");

for (const token of [
  'id:"overview", label:"Overview"', 'id:"flow", label:"Flow"', 'id:"solar", label:"Solar"',
  'id:"battery", label:"Home Battery"', 'id:"consumers", label:"Consumers"', 'id:"gas", label:"Gas"',
  'id:"strategy", label:"Strategy"', 'id:"operational-planning", label:"Operational Planning"',
  'id:"tactical-planning", label:"Tactical Planning"', 'id:"strategic-planning", label:"Strategic Planning"',
  'id:"metering", label:"Metering"', 'id:"value", label:"Value"', 'id:"retrospective", label:"Retrospective"'
]) assert.ok(presentation.includes(token), "missing existing tab "+token);

assert.ok(presentation.includes('gas: "heroes/gas-page-hero-v3.webp"'), "Gas page must use immutable photographic hero v3");
assert.ok(!presentation.includes('gas: "heroes/gas-hero.webp"'), "legacy Gas page hero mapping must not return");
assert.ok(!presentation.includes('gas: "heroes/gas-page-hero-v2.svg"'), "blurred Gas SVG transport must not return");
assert.ok(app.includes("if (tab === 'gas') return !!target && type === 'gas_meter';"), "Gas page must reject global/untargeted commands");
assert.ok(app.includes("window.loadCardHelpers"), "Gas statistics graph must use Home Assistant card helpers");
assert.ok(app.includes("helpers.createCardElement"), "Gas statistics graph must lazy-create the native card");

assert.match(header,/metrics = \[\],[\s\S]*commandActions = ""/);
assert.ok(!header.includes("contextControls"));
assert.match(header,/rhiUxQuickActionBar/);
assert.ok(!app.includes("contextControls:this.pageContextControls(rt, tab)"));
assert.ok(app.includes("commandActions:this.pageQuickActions(rt, tab)"));
assert.match(app,/pageContextControls\(rt, tab\)/);
assert.match(app,/bodyContextBar\(rt, tab/);
assert.match(app,/rhiUxContextBar/);
for (const tab of ["outlook","consumers","metering","planning","value"]) {
  assert.ok(app.includes(`tab === '${tab}'`), "missing body-scoped context case "+tab);
}
const contextBlock=app.slice(app.indexOf("pageContextControls(rt, tab)"),app.indexOf("bodyContextBar(rt, tab"));
for(const nav of ["Energy flow","Strategy","Tactical planning","Solar plan","Flexible loads","Usage history","Gas meter","Consumer list"]) {
  assert.ok(!contextBlock.includes(nav), "navigation leaked into body View controls: "+nav);
}
assert.ok(!app.includes("data:image/webp;base64"), "binary presentation images must be packaged assets");

assert.match(app,/publishedById = new Map/);
assert.match(app,/visual_ref:firstDefined\(raw\.visual_ref/);
assert.match(app,/energyAssetDetailDisclosure/);
assert.match(app,/energyDeviceState/);
assert.match(app,/\['Telemetry', telemetry\]/);
assert.match(app,/assetQuickActions\(rt, assetId/);
assert.match(app,/rt\.commandActionModelsForAsset\(id\)/);
assert.match(app,/Telemetry limited/);
assert.match(app,/per-battery power is not published/);
assert.match(app,/solarProductionHierarchy/);
assert.match(app,/solarOptimizerPrimaryCard/);
assert.match(app,/OPTIMIZER \/ PANEL/);
assert.doesNotMatch(app,/No panels linked to this zone/);
assert.match(app,/solarTopologyDetails/);
assert.match(app,/solarTopologyDiagnostics/);
assert.match(app,/No charging topology published/);

for (const token of ["flexible_asset.generic","consumer.generic","solar_array.generic","inverter.generic","site_consumption.home","energy_system.home"]) {
  assert.ok(catalog.includes(token), "missing representative visual fallback "+token);
}

assert.match(core,/RHI UX Core 1\.5\.2/);
assert.match(core,/function rhiUxContextBar/);
assert.match(core,/function rhiUxResolveDomainAssetNavigation/);
assert.ok(core.includes("{asset_id}"), "runtime-safe Core navigation token missing");
assert.ok(!core.includes("__RHI_ASSET_ID__"), "stale build-placeholder-style Core navigation token returned");
assert.match(core,/\.rhiUxPageHeroArt\s*\{[\s\S]*?position:absolute/);
assert.match(core,/\.rhiUxStatusGrid\s*\{/);
assert.match(core,/\.rhiUxQuickActionBar/);
assert.match(core,/\.rhiUxPageStack>\.rhiUxPageHero\{order:1\}/);
assert.match(core,/\.rhiUxPageStack>\.rhiUxStatusGrid\{order:2\}/);
assert.match(core,/\.rhiUxPageStack>\.rhiUxQuickActionBar\{order:3\}/);
assert.match(header,/rhiEnergyPageHeader rhiUxPageStack/);
assert.doesNotMatch(presentation,/\.rhiUxPageHero\s*\{/);
assert.doesNotMatch(presentation,/\.rhiUxStatusGrid\s*\{/);
assert.doesNotMatch(presentation,/\.rhiUxQuickActionBar\s*\{/);
assert.match(app,/object-fit:contain/);
assert.ok(app.includes('rhiUxDomainShell({'));
assert.match(app,/domain:'ENERGIE'/);
assert.ok(app.includes('strategicPlanning(rt)'), "Strategic Planning must be a real contract-backed surface");
assert.ok(app.includes('Strategy configuration is the authority for longer-term intent'), "Strategic Planning must explain its contract authority");
assert.ok(!app.includes('Strategic planning content follows in the next screen pass'), "Strategic Planning placeholder must not return");

console.log("PASS Energy 4.3 canonical page/body controls, asset grammar, visuals and responsive ownership");
