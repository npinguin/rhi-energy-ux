const fs = require('fs');
const vm = require('vm');

const pickerSource = fs.readFileSync('src/ui/components/energy-visual-picker.js','utf8');
const cardSource = fs.readFileSync('src/app/energy-card.js','utf8');
const catalogSource = fs.readFileSync('src/app/energy-asset-catalog.js','utf8');

for (const required of [
  'data-energy-visual-brand',
  'data-energy-visual-select',
  'data-energy-visual-save',
  'data-energy-visual-cancel',
  'Save appearance',
  'Use profile default',
  'rhiUxVisualPickerShell'
]) {
  if (!pickerSource.includes(required) && !cardSource.includes(required)) {
    throw new Error('missing coherent appearance editor control: ' + required);
  }
}

for (const forbidden of [
  'homebrain.energy.visual_preferences.v1',
  'rhiEnergySetVisualPreference',
  'rhiEnergyClearVisualPreference'
]) {
  if (catalogSource.includes(forbidden) || cardSource.includes(forbidden)) {
    throw new Error('browser-local visual preference authority remains: ' + forbidden);
  }
}
if (!cardSource.includes('persistEnergyVisualPreference(assetId, visualRef)')) throw new Error('Save must use canonical backend persistence');
if (!cardSource.includes("rt.publicV2().property('asset.visual_ref', id)")) throw new Error('picker must use per-asset Public V2 visual property');
if (!cardSource.includes("this._hass.callService(meta.domain, meta.action")) throw new Error('picker must use published Energy writer');
if (!cardSource.includes("sourceOwner && !['rhi_energy','rhi_energy_ux'].includes(sourceOwner)")) throw new Error('producer-owned visuals must be non-overridable');
if (!cardSource.includes('energyVisualPickerDraftRef')) throw new Error('appearance editor requires local draft selection');

const context = { console, globalThis:{}, Object, Array, String, JSON };
vm.createContext(context);
vm.runInContext(catalogSource + '\n'
  + 'globalThis.rhiEnergyVisualCatalogForType=rhiEnergyVisualCatalogForType;'
  + 'globalThis.rhiEnergyVisualBrandsForType=rhiEnergyVisualBrandsForType;', context);
const brands = Array.from(context.globalThis.rhiEnergyVisualBrandsForType('solar_inverter'));
if (brands.join('|') !== 'Generic|SolarEdge') {
  throw new Error('brand filter must be derived, unique and sorted for the current asset type: ' + brands.join('|'));
}

console.log('PASS shared Energy appearance picker with backend persistence and producer ownership');
