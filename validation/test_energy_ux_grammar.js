const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("src/app/energy-card.js","utf8");
const header = fs.readFileSync("src/ui/components/page-header.js","utf8");
const presentation = fs.readFileSync("src/app/presentation.js","utf8");
const catalog = fs.readFileSync("src/app/energy-asset-catalog.js","utf8");
const core = fs.readFileSync("src/vendor/rhi-ux-core.js","utf8");

for (const [id,labelKey] of [
  ["overview","nav.overview"],["flow","nav.flow"],["solar","nav.solar"],["battery","nav.battery"],
  ["consumers","nav.consumption"],["gas","nav.gas"],["settings","nav.settings"],
  ["plan","nav.plan"],["metering","nav.performance"],
  ["value","nav.value"],["retrospective","nav.retrospective"]
]) {
  assert.ok(presentation.includes(`id:"${id}"`) && presentation.includes(`labelKey:"${labelKey}"`), "missing localized navigation definition "+id);
}
assert.match(presentation,/function hbEnergyNavigation\(hass = null\)/);
assert.match(presentation,/label:rhiEnergyT\(hass,section\.labelKey/);

assert.ok(presentation.includes('gas: "heroes/gas-page-hero-v3.webp"'), "Gas page must use immutable photographic hero v3");
assert.ok(!presentation.includes('gas: "heroes/gas-hero.webp"'), "legacy Gas page hero mapping must not return");
assert.ok(!presentation.includes('gas: "heroes/gas-page-hero-v2.svg"'), "blurred Gas SVG transport must not return");
assert.ok(app.includes("type === 'energy_system' || target === 'energy' || target === 'energy_system'"), "Page headers must reject asset-scoped commands and keep only system-level actions");
assert.ok(!app.includes("if (tab === 'gas') return !!target && type === 'gas_meter';"), "Gas must not regain a page-specific asset-command exception");
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
assert.match(app,/visual_ref:firstDefined\(vm\.visualRef, raw\.visual_ref, published\.visual_ref/);
assert.match(app,/energyAssetDetailDisclosure/);
assert.match(app,/energyDeviceState/);
assert.match(app,/\['Telemetry', telemetry\]/);
assert.match(app,/assetQuickActions\(rt, assetId/);
assert.match(app,/rt\.commandActionModelsForAsset\(id\)/);
assert.match(app,/Measurements limited/);
assert.match(app,/per-battery power is not available/);
assert.match(app,/solarProductionHierarchy/);
assert.match(app,/solarOptimizerPrimaryCard/);
assert.match(app,/OPTIMIZER \/ PANEL/);
assert.doesNotMatch(app,/No panels linked to this zone/);
assert.match(app,/solarTopologyDetails/);
assert.match(app,/solarTopologyDiagnostics/);
assert.match(app,/No charging connections available/);

for (const token of [
  "battery_system.generic",
  "battery.byd_lvs_20",
  "solar_zone.generic",
  "solar_panel.sunpower_x21_335_blk",
  "solar_inverter.solaredge_rwb_10k",
  "solar_optimizer.solaredge_s500b",
  "backup_interface.solaredge_3phase",
  "gas_meter.flonidan_uniflo_g4",
  "grid_meter.sagemcom_t211_d3"
]) {
  assert.ok(catalog.includes(token), "missing physical visual catalog entry "+token);
}
assert.doesNotMatch(catalog,/heroes\//);
for (const logicalType of ["flexible_asset","consumer","solar_array","inverter","site_consumption","energy_system"]) {
  assert.ok(!catalog.includes(`asset_type:"${logicalType}"`), "logical/non-canonical visual fallback returned "+logicalType);
}

assert.ok(core.includes('const RHI_UX_CORE_VERSION = "1.6.0";'), 'Energy must vendor UX Core 1.6.0');
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
assert.match(app,/domain:rhiEnergyT\(this\._hass,'nav\.energy',\{\},'Energy'\)\.toUpperCase\(\)/);
assert.ok(app.includes('strategicPlanning(rt)'), "Strategic Planning must be a real contract-backed surface");
assert.ok(app.includes('This view explains how your current settings influence longer-term energy behavior.'), "Strategic Planning must explain longer-term behavior in user language");
assert.ok(!app.includes('Strategic planning content follows in the next screen pass'), "Strategic Planning placeholder must not return");

console.log("PASS Energy 4.3 canonical page/body controls, asset grammar, visuals and responsive ownership");


const intelligenceBlock = presentation.slice(presentation.indexOf('id:"intelligence"'), presentation.indexOf('id:"insights"'));
assert.ok(intelligenceBlock.lastIndexOf('id:"settings"') > intelligenceBlock.indexOf('id:"plan"'), "Settings must be the last Intelligence tab");
assert.ok(!intelligenceBlock.includes('id:"operational-planning"') && !intelligenceBlock.includes('id:"tactical-planning"') && !intelligenceBlock.includes('id:"strategic-planning"'), "planning subviews must not return as top-level navigation tabs");
assert.ok(app.includes("['operational-planning','planning','strategic-planning'].includes(tab)"), "Plan must expose operational/tactical/strategic internal views");
assert.ok(!app.includes("understandingFooter(rt, this.view)"), "legacy Conclusion footer must not be injected into product views");
assert.ok(!app.includes("understandingFooter(rt, tab)"), "legacy Conclusion component must be removed");
assert.ok(app.includes("this.config?.show_diagnostics !== true"), "technical footer must be explicitly diagnostics-gated");
assert.ok(app.includes("rhiUxTechnicalFooter({"), "diagnostics footer must use shared Core primitive");


for (const needle of [
  "Energy assessment unavailable",
  "Historical statistics not available yet",
  "The current meter reading is available; historical statistics are separate.",
  "userRelationshipLabel(value, fallback = 'Assigned charger')",
  "coherentCommandModels(models = [], stateHint = '')",
  "4.3.28 target-HA phone closure",
  ".batteryGrid.batteryGridTwoUp{display:grid;grid-template-columns:1fr!important"
]) assert.ok(app.includes(needle), "target-HA UX closure missing: "+needle);
assert.ok(!app.includes("Configured · physical identity not proven"), "Energy normal UX must not expose technical physical-identity wording");
console.log("PASS target-HA product-safe actions, Gas capability copy and phone flow closure");
