const fs = require('fs');

const card = fs.readFileSync('src/app/energy-card.js','utf8');

// Future producer visuals must require zero product-specific Energy mapping.

const required = [
  'assetVisual(asset = {}',
  'assetIdentityChip(asset = {}',
  "this.assetVisual(load,{size:'sm'",
  "this.assetVisual(item.asset,{size:'xs'",
  'this.assetIdentityChip(item.asset',
  "this.assetVisual(load,{size:'xs'"
];
for (const token of required) {
  if (!card.includes(token)) throw new Error('missing picture-first asset identity usage: ' + token);
}
if (!card.includes('resolveEnergyAssetVisual(asset, rt.visualRegistry()')) {
  throw new Error('asset visual primitive must resolve canonical visual_ref through Foundation registry context');
}
if (card.includes("visualRef.startsWith('mobility.')")) {
  throw new Error('Energy visual picker must not hardcode Mobility ownership');
}
if (!card.includes('.assetVisual{') || !card.includes('.assetIdentityChip{')) {
  throw new Error('asset picture primitives require package-owned styling');
}
console.log('PASS picture-first asset identity across Energy UX');
