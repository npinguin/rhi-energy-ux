import fs from 'node:fs';
import vm from 'node:vm';

const bundle = fs.readFileSync(new URL('../dist/rhi-energy-ux.js', import.meta.url), 'utf8');
const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

class HTMLElement {
  attachShadow() {
    return { querySelector: () => null, querySelectorAll: () => [], childNodes: [], innerHTML: '' };
  }
}
const registry = new Map();
const customElements = {
  get: name => registry.get(name),
  define: (name, ctor) => registry.set(name, ctor)
};
const session = new Map();
const sessionStorage = {
  getItem: key => session.has(key) ? session.get(key) : null,
  setItem: (key, value) => session.set(key, String(value)),
  removeItem: key => session.delete(key)
};
const window = { customCards: [], sessionStorage, scrollX: 0, scrollY: 0, scrollTo: () => {} };
const context = {
  console,
  HTMLElement,
  customElements,
  window,
  document: {},
  setTimeout,
  clearTimeout,
  globalThis: null
};
context.globalThis = context;
window.window = window;

vm.createContext(context);
vm.runInContext(bundle, context, { timeout: 10000 });

for (const name of ['homebrain-energy-card', 'homebrain-energy-domain-card']) {
  if (!registry.has(name)) throw new Error(`custom element not registered: ${name}`);
}
if (!bundle.includes(`const UX_VERSION = 'R${pkg.version}'`)) {
  throw new Error(`runtime version does not match package ${pkg.version}`);
}
const EnergyCard = registry.get('homebrain-energy-card');
const first = new EnergyCard();
first.navSection = 'insights';
first.navItem = 'metering';
first.navSelectionBySection = { energy:'overview', intelligence:'operational-planning', insights:'metering' };
first.view = 'metering';
first.selectedMeteringPeriodId = 'hour';
first._meteringPeriodHydrated = true;
first.selectedOutlookHorizonId = 'D1';
first.selectedPlanningHorizonId = 'D1';
first.selectedMeteringHorizonId = 'D1';
first.selectedStrategyProfileId = 'ev';
first.loadSort = 'power';
first.meteringSort = 'largest';
first.consumerSort = 'name';
first.consumerFilter = 'active';
first.disclosureOpen = { 'metering:details': true };
first.navScrollLeft = 88;
first.planningScrollLeft = 144;
first.planningScrollTop = 233;
first.editDrafts = { 'strategy.target': 42 };
first.writeFeedback = { 'metering.selected_period': { state: 'pending' } };
first.persistInteractionContext();

const stored = JSON.parse(sessionStorage.getItem('homebrain.energy.interaction_context.v1'));
if ('editDrafts' in stored || 'writeFeedback' in stored || 'remediationFeedback' in stored) {
  throw new Error('ephemeral runtime/edit state leaked into persisted interaction context');
}

const recreated = new EnergyCard();
const expected = {
  navSection: 'insights',
  navItem: 'metering',
  view: 'metering',
  selectedMeteringPeriodId: 'hour',
  selectedOutlookHorizonId: 'D1',
  selectedPlanningHorizonId: 'D1',
  selectedMeteringHorizonId: 'D1',
  selectedStrategyProfileId: 'ev',
  loadSort: 'power',
  meteringSort: 'largest',
  consumerSort: 'name',
  consumerFilter: 'active',
  navScrollLeft: 88,
  planningScrollLeft: 144,
  planningScrollTop: 233
};
for (const [key, value] of Object.entries(expected)) {
  if (recreated[key] !== value) throw new Error(`interaction context not restored for ${key}: ${recreated[key]} !== ${value}`);
}
if (!recreated._meteringPeriodHydrated) throw new Error('restored Metering period must not be overwritten by backend hydration');
if (!recreated.disclosureOpen['metering:details']) throw new Error('disclosure state not restored');
if (recreated.navSelectionBySection.intelligence !== 'operational-planning') throw new Error('per-section navigation memory not restored');

const model = recreated.navigationModel();
if (model.map(section => section.id).join('|') !== 'energy|intelligence|insights') throw new Error('two-level navigation sections drifted');
const energy = model.find(section => section.id === 'energy');
const intelligence = model.find(section => section.id === 'intelligence');
const insights = model.find(section => section.id === 'insights');
if (energy.items.map(item => item.id).join('|') !== 'overview|flow|solar|battery|consumers|gas') throw new Error('Energy navigation order drifted');
if (intelligence.items.map(item => item.id).join('|') !== 'strategy|operational-planning|tactical-planning|strategic-planning') throw new Error('Intelligence navigation order drifted');
if (insights.items.map(item => item.id).join('|') !== 'metering|value|retrospective') throw new Error('Insights navigation order drifted');
if (recreated.resolveNavigation('', '', 'solar').item !== 'solar') throw new Error('Solar must resolve to the Energy Solar tab');
if (recreated.resolveNavigation('', '', 'operational-planning').item !== 'operational-planning') throw new Error('Operational Planning must keep its own renderer');
if (recreated.resolveNavigation('', '', 'planning').item !== 'tactical-planning') throw new Error('legacy Planning must migrate to Tactical Planning');
if (recreated.resolveNavigation('', '', 'intelligence').item !== 'strategy') throw new Error('legacy Intelligence must migrate to Strategy');
const navMarkup = recreated.nav();
if (!/rhiUxModuleTabs/.test(navMarkup) || !/rhiUxDomainTabs/.test(navMarkup)) throw new Error('shared Core two-level navigation not rendered');
if (!/rhiUxDomainIdentity/.test(navMarkup) || !/Home Intelligence/.test(navMarkup) || !/ENERGIE/.test(navMarkup)) throw new Error('shared Core domain identity not rendered');
if (!/rhiUxCompanyBrand/.test(navMarkup)) throw new Error('shared Core company brand not rendered');
if (!/data-rhi-module/.test(navMarkup) || !/data-rhi-item/.test(navMarkup)) throw new Error('shared Core navigation routing hooks missing');

const unavailableSelector = recreated.componentScopeSelector({
  context: 'outlook',
  title: 'Horizon',
  items: [{ horizon_id: 'D0', label: 'Today' }],
  selectedId: 'D1',
  idField: 'horizon_id',
  labelFn: item => item.label
});
if (/scopeOption active/.test(unavailableSelector)) throw new Error('missing requested selector silently activated another option');
if (!/Selected horizon temporarily unavailable/.test(unavailableSelector)) throw new Error('missing requested selector does not expose unavailable state');

console.log('PASS bundle load, two-level navigation, lifecycle recreation and custom-element registration smoke');
