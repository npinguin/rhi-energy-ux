const fs=require('fs');
const card=fs.readFileSync('src/app/energy-card.js','utf8');

for (const token of [
  'canonicalAssetFor(rt, row = {})',
  'managedAssetIdentity',
  'strategyAssetIdentity',
  'meteringAssetIdentity',
  'valueAssetIdentity',
  "this.assetVisual(asset,{size:'sm'",
  "this.assetVisual(vm.raw||{}, {size:'xs'",
  "this.assetVisual(asset,{size:'xs'",
  '/^(undefined|null|none)$/i.test(sourceLabel)'
]) {
  if(!card.includes(token)) throw new Error('missing Energy-wide asset identity closure: '+token);
}
if(!card.includes('valueConsumerRow')) throw new Error('consumer allocation must use asset identity rendering');
console.log('PASS Energy-wide picture-first asset identity');
