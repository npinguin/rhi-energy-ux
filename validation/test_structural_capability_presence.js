// Structural capability presence must drive product UX, not telemetry nulls.
const fs = require('fs');
const vm = require('vm');

const runtime = fs.readFileSync('src/runtime/energy-v2-contract.js','utf8');
const app = fs.readFileSync('src/app/energy-card.js','utf8');

// Product presence reflects published objects (including unavailable ones),
// never the temporary measured value or an aggregate Public V2 snapshot.
for(const token of [
  'const objectClasses=new Set(objects.map',
  "battery:objectClasses.has('battery_system')",
  "gas:objectClasses.has('gas_meter')",
  "flexible_loads:objectClasses.has('flexible_load')",
  'pricing:pricingRows.length>0',
  'experience:{presence},presence,'
]) if(!runtime.includes(token))throw new Error('native structural presence owner missing '+token);
if(runtime.includes('object(experience.presence)'))throw new Error('retired snapshot presence returned');
if (!app.includes("if(item.id === 'battery') return has('battery', false)")) throw new Error('Battery navigation not presence-gated');
if (!app.includes("if(item.id === 'gas') return has('gas', false)")) throw new Error('Gas navigation not presence-gated');
if (!app.includes("if(item.id === 'consumers') return showConsumers")) throw new Error('Consumers navigation not presence-gated');
if (!app.includes("if(item.id === 'value') return showValue")) throw new Error('Value navigation not pricing-presence-gated');
if (!app.includes("experiencePresence()")) throw new Error('Presence not exposed through EnergyRuntime');
if (!app.includes("rt.experiencePresence().battery === true")) throw new Error('Overview battery surfaces not presence-gated');
if (!app.includes("rt.experiencePresence().flexible_loads === true ? this.overviewEnergyRow")) throw new Error('Overview flexible-load aggregate not presence-gated');
if (!app.includes("rt.experiencePresence().battery === true && balanceVm.battery.direction")) throw new Error('Overview battery flow participant not presence-gated');

console.log('PASS native structural capability presence UX, independent of transient telemetry');
