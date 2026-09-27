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
  'Save image',
  'Use profile default'
]) {
  if (!pickerSource.includes(required) && !cardSource.includes(required)) {
    throw new Error('missing coherent image editor control: ' + required);
  }
}

if (cardSource.includes("rhiEnergySetVisualPreference(asset, visualRef);\n        this.energyVisualPickerAssetId = '';")) {
  throw new Error('image choice still auto-saves and closes instead of using explicit Save');
}
if (!cardSource.includes('energyVisualPickerDraftRef')) throw new Error('image editor requires a draft visual selection');
if (!cardSource.includes('energyVisualPickerBrand')) throw new Error('image editor requires a local brand filter');
if (!cardSource.includes("rhiEnergySetVisualPreference(asset, this.energyVisualPickerDraftRef)")) {
  throw new Error('Save image must persist the draft selection');
}

const context = { console, globalThis:{localStorage:null}, Object, Array, String, JSON };
vm.createContext(context);
vm.runInContext(catalogSource + '\n'
  + 'globalThis.rhiEnergyVisualCatalogForType=rhiEnergyVisualCatalogForType;'
  + 'globalThis.rhiEnergyVisualBrandsForType=rhiEnergyVisualBrandsForType;', context);
const brands = Array.from(context.globalThis.rhiEnergyVisualBrandsForType('solar_inverter'));
if (brands.join('|') !== 'Generic|SolarEdge') {
  throw new Error('brand filter must be derived, unique and sorted for the current asset type: ' + brands.join('|'));
}

console.log('PASS coherent Energy image editor with draft, brand filter and explicit Save');
