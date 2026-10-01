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
  'Battery',
  'Home',
  'Grid',
  'fmtKw(solar',
  'fmtKw(site',
  'data-scroll-target="solar-production-detail"',
  'data-scroll-target="solar-battery-detail"'
]) {
  assert.ok(story.includes(required), 'compact solar value flow missing: ' + required);
}
assert.ok(app.includes('solarProductionObject'), 'solar production root object remains available');
assert.ok(app.includes("solarHardwareSection(\n            'Solar Production'"), 'solar production uses the same top-level section shell as Home Battery');
assert.ok(!story.includes('data-scroll-target="solar-inverter-detail"'), 'inverter must not be a primary flow node');
const solarAt = story.indexOf('<small>Solar</small>');
const batteryAt = story.indexOf('<small>Battery</small>');
const homeAt = story.indexOf('<small>Home</small>');
const gridAt = story.indexOf('<small>Grid</small>');
assert.ok(solarAt < batteryAt && batteryAt < homeAt && homeAt < gridAt, 'primary flow order must be Solar > Battery > Home <> Grid');
assert.ok(app.includes("solarHardwareSection(\n        'Home Battery'"), 'battery detail remains available');
assert.ok(app.includes("'solar-production-detail'"), 'solar production top-level section has scroll target');
assert.ok(app.includes('id="solar-inverter-detail"'), 'nested inverter hierarchy has diagnostic anchor');
assert.ok(app.includes("'solar-battery-detail'"), 'battery system has scroll target');

console.log('PASS compact value-first solar flow');
