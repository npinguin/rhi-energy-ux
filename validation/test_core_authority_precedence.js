const fs = require('fs');

const source = fs.readFileSync('src/app/energy-card.js','utf8');
const start = source.indexOf('allRows() {');
const end = source.indexOf('propertyRows()', start);
if (start < 0 || end < 0) throw new Error('EnergyRuntime.allRows not found');
const block = source.slice(start,end);

if (!block.includes('this.canonicalIndex?.uniqueProductRows?.()')) {
  throw new Error('canonical property index must be the sole Energy row authority');
}
for (const forbidden of [
  'v2.coreByKey',
  'v2.allPropertyRows',
  "asset_id:'core'",
  "source_type:'canonical_v2_core'",
  'this.publicV2()'
]) {
  if (block.includes(forbidden)) throw new Error('aggregate Public V2 row fallback remains: '+forbidden);
}
console.log('PASS canonical Energy properties are the sole row authority; aggregate Core/object rows cannot backfill product truth');
