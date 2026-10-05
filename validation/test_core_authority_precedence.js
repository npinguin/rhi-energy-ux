const fs = require('fs');

const source = fs.readFileSync('src/app/energy-card.js','utf8');
const start = source.indexOf('allRows() {');
const end = source.indexOf('propertyRows()', start);
if (start < 0 || end < 0) throw new Error('EnergyRuntime.allRows not found');
const block = source.slice(start,end);
const core = block.indexOf('for (const [key, field] of (v2.coreByKey || new Map()).entries())');
const objects = block.indexOf('(v2.allPropertyRows || []).forEach(add)');
if (core < 0 || objects < 0) throw new Error('core/object row projection anchors missing');
if (core > objects) throw new Error('canonical Public V2 Core must precede generic object/configuration rows');
if (!block.includes("asset_id:'core'") || !block.includes("source_type:'canonical_v2_core'")) {
  throw new Error('canonical Core row identity missing');
}
console.log('PASS Public V2 Core has global aggregate property precedence');
