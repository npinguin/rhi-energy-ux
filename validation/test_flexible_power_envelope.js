const fs = require('fs');

const runtime = fs.readFileSync('src/runtime/energy-v2-contract.js','utf8');
const card = fs.readFileSync('src/app/energy-card.js','utf8');

if (!runtime.includes("['flexible_loads.available_power_kw', coreField('flexible','available_power_kw')]")) {
  throw new Error('Public V2 core flexible available_power_kw is not mapped as canonical field');
}
if (!runtime.includes("available_power_kw:'kW'")) {
  throw new Error('available_power_kw unit mapping missing');
}
if (!card.includes("const flexibleLoadBudget = rt.number('flexible_loads.available_power_kw');")) {
  throw new Error('Energy pages do not consume the canonical flexible-load power envelope');
}
if (/const\s+flexibleLoadBudget\s*=\s*null/.test(card)) {
  throw new Error('hardcoded unavailable flexible-load budget returned');
}
if (/flexibleLoadBudget\s*=.*grid_export|flexibleLoadBudget\s*=.*forecast|flexibleLoadBudget\s*=.*battery/i.test(card)) {
  throw new Error('frontend is reconstructing backend-owned available power');
}
console.log('PASS canonical flexible-load available power consumption');
