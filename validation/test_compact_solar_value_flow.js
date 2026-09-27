const fs = require('fs');
const assert = require('assert');
const app = fs.readFileSync('src/app/energy-card.js','utf8');

const start = app.indexOf('\n    solarEnergyStory(rt)');
const end = app.indexOf('\n    energyHardwareStyles()', start);
assert.ok(start > 0 && end > start, 'solar compact flow method must exist');
const story = app.slice(start,end);

for (const obsolete of [
  'What is happening with my solar?',
  'What are my panels doing?',
  'What is my home using?',
  'What is the battery doing?',
  'What is happening at the grid?',
  'Where is my solar going?',
  'solarAnswerGrid'
]) {
  assert.ok(!story.includes(obsolete), 'verbose solar story must not contain: ' + obsolete);
}
for (const required of [
  'solarValueFlow',
  'Solar',
  'Home',
  'Battery',
  'Grid',
  'fmtKw(solar',
  'fmtKw(site',
  'data-scroll-target="solar-production-detail"',
  'data-scroll-target="solar-inverter-detail"',
  'data-scroll-target="solar-battery-detail"'
]) {
  assert.ok(story.includes(required), 'compact solar value flow missing: ' + required);
}
assert.ok(app.includes("solarHardwareSection('Solar production'"), 'solar production detail remains available');
assert.ok(app.includes("solarHardwareSection(\n        'Inverter system'"), 'inverter detail remains available');
assert.ok(app.includes("solarHardwareSection(\n        'Home Battery'"), 'battery detail remains available');
assert.ok(app.includes('id="solar-production-detail"'), 'solar production has scroll target');
assert.ok(app.includes('id="solar-inverter-detail"'), 'inverter system has scroll target');
assert.ok(app.includes('id="solar-battery-detail"'), 'battery system has scroll target');

console.log('PASS compact value-first solar flow');
