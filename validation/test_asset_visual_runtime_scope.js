'use strict';

const fs = require('fs');
const assert = require('node:assert/strict');

const card = fs.readFileSync('src/app/energy-card.js','utf8');
const match = card.match(/assetVisual\(asset = \{\}, \{ size = 'md', fallbackIcon = '◆', decorative = true \} = \{\}\) \{([\s\S]*?)\n    \}\n    energyVisualPickerOverlay/);
assert.ok(match, 'assetVisual method not found');
const body = match[1];

assert.match(body, /const rt = this\.runtime\(\);/, 'assetVisual must acquire runtime explicitly');
const declaration = body.indexOf('const rt = this.runtime();');
const firstRuntimeUse = body.indexOf('rt.');
assert.ok(declaration >= 0, 'assetVisual runtime declaration missing');
assert.ok(firstRuntimeUse > declaration, 'assetVisual must declare rt before any runtime use');
assert.match(body, /rt\.visualRegistry\(\)/);
assert.match(body, /rt\.resolveVisualRef\(/);

for (const screen of ['solar','battery','consumers','gas']) {
  assert.match(card, new RegExp(`\\b${screen}\\(rt\\)`), `${screen} screen must retain explicit runtime parameter`);
}

console.log('PASS assetVisual runtime scope and primary Energy screen render contract');
