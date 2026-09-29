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
  'Use profile default'
]) {
  if (!pickerSource.includes(required) && !cardSource.includes(required)) {
    throw new Error('missing coherent image editor control: ' + required);
  }
}

if (!cardSource.includes('energyVisualPickerDraftRef')) throw new Error('image editor requires a draft visual selection');
if (!cardSource.includes('energyVisualPickerBrand')) throw new Error('image editor requires a local brand filter');
if (!cardSource.includes("energy_visual_picker_save") || !cardSource.includes("appearance:") || !cardSource.includes(":visual_ref")) {
  throw new Error('Save appearance must persist through canonical Energy appearance property');
}
if (!cardSource.includes("energy_visual_picker_reset")) {
  throw new Error('Use profile default must clear persisted Energy appearance through canonical write');
}
if (!pickerSource.includes('rhiUxVisualPickerShell')) throw new Error('Energy picker must use shared UX Core visual picker shell');
if (/localStorage|rhiEnergySetVisualPreference|rhiEnergySelectedVisualRef/.test(catalogSource+cardSource)) {
  throw new Error('browser-local appearance persistence returned');
}
if (/heroes\//.test(catalogSource)) {
  throw new Error('dashboard hero artwork leaked into physical visual picker catalog');
}

const context = { console, globalThis:{localStorage:null}, Object, Array, String, JSON };
vm.createContext(context);
vm.runInContext(catalogSource + '\n'
  + 'globalThis.rhiEnergyVisualCatalogForType=rhiEnergyVisualCatalogForType;'
  + 'globalThis.rhiEnergyVisualBrandsForType=rhiEnergyVisualBrandsForType;', context);
const brands = Array.from(context.globalThis.rhiEnergyVisualBrandsForType('solar_inverter'));
if (brands.join('|') !== 'Huawei|SMA|SolarEdge') {
  throw new Error('brand filter must be derived, unique and sorted for the current physical asset type: ' + brands.join('|'));
}
if (context.globalThis.rhiEnergyVisualCatalogForType('grid_connection').length !== 0) {
  throw new Error('logical grid_connection must not expose physical image choices');
}

console.log('PASS canonical Energy appearance editor with physical-only catalog and backend persistence');

if (!pickerSource.includes('.rhiUxVisualChoiceImage img') || !pickerSource.includes('object-fit:contain!important')) {
  throw new Error('picker artwork must be bounded independently of source dimensions');
}
if (!cardSource.includes('pendingAppearanceByAsset') || !cardSource.includes('reconcilePendingAppearances')) {
  throw new Error('appearance selection must render optimistically until authoritative readback');
}
if (!cardSource.includes('assetVisualAppearance')) {
  throw new Error('Appearance action must be rendered consistently inside the image zone');
}
