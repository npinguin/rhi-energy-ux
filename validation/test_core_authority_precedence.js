const fs = require('fs');

const source = fs.readFileSync('src/app/energy-card.js','utf8');
const start = source.indexOf('allRows() {');
const end = source.indexOf('propertyRows()', start);
if (start < 0 || end < 0) throw new Error('EnergyRuntime.allRows not found');
const block = source.slice(start,end);

const canonical = block.indexOf('const canonicalCurrentKeys = new Set([');
const objects = block.indexOf('(v2.allPropertyRows || []).forEach(add)');
if (canonical < 0 || objects < 0) throw new Error('canonical/object row projection anchors missing');
if (canonical > objects) throw new Error('canonical current projection must precede generic object/configuration rows');
if (!block.includes("const field = v2.canonicalField(key)") || !block.includes("asset_id:'canonical_current'") || !block.includes("source_type:'canonical_v2_projection'")) {
  throw new Error('canonical current row identity missing');
}
if (block.includes("source_type:'canonical_v2_core'")) throw new Error('legacy core-only global authority returned');

console.log('PASS canonical Public V2 semantic projection has global current-fact precedence');
