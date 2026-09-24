const fs = require('fs');

const card = fs.readFileSync('src/app/energy-card.js','utf8');

const required = [
  'assetVisual(asset = {}',
  'assetIdentityChip(asset = {}',
  "this.assetVisual(load,{size:'sm'",
  "this.assetVisual(item.asset,{size:'xs'",
  'this.assetIdentityChip(item.asset',
  'this.assetIdentityChip(x.asset',
  "this.assetVisual(load,{size:'xs'"
];
for (const token of required) {
  if (!card.includes(token)) throw new Error('missing picture-first asset identity usage: ' + token);
}
if (!card.includes('resolveEnergyVisualRef(visualRef)')) {
  throw new Error('asset visual primitive must resolve canonical visual_ref');
}
if (!card.includes('.assetVisual{') || !card.includes('.assetIdentityChip{')) {
  throw new Error('asset picture primitives require package-owned styling');
}
console.log('PASS picture-first asset identity across Energy UX');
