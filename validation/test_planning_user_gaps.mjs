import fs from 'node:fs';
import assert from 'node:assert/strict';
const card=fs.readFileSync('src/app/energy-card.js','utf8');
assert.match(card,/planningInputIncomplete/);
assert.match(card,/Set a target charge level/);
assert.match(card,/Set a ready-by time/);
assert.match(card,/Assign a charger/);
assert.match(card,/No flexible loads currently need planning/);
console.log('PASS planning user gaps');
