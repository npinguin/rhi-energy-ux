const fs=require('fs');
const card=fs.readFileSync('src/app/energy-card.js','utf8');

for (const token of [
  'valueAssetIdentity(rt, item = {})',
  'valueConsumerRow',
  'this.assetVisual(identity.asset',
  "this.assetVisual(asset,{size:'sm'",
  'const candidateIds = [',
  'const canonicalId = String(firstDefined(match.asset_id',
  'asset_id: canonicalId || row.asset_id ||'
]) {
  if(!card.includes(token)) throw new Error('missing canonical visual identity path: '+token);
}
if (card.includes("exceptions.map(x=>escapeHtml(x.name))")) {
  throw new Error('exception summary regressed to text-only asset names');
}
console.log('PASS canonical asset identity drives pictures across Energy Value and consumer allocation');
