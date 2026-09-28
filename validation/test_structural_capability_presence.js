// Structural capability presence must drive product UX, not telemetry nulls.
const fs = require('fs');
const vm = require('vm');

const runtime = fs.readFileSync('src/runtime/energy-v2-contract.js','utf8');
const app = fs.readFileSync('src/app/energy-card.js','utf8');

if (!runtime.includes('const presence = Object.freeze({...object(experience.presence)})')) throw new Error('Public V2 presence not consumed');
if (!runtime.includes('presence,')) throw new Error('Presence not exposed by normalized V2 store');
if (!app.includes("if(item.id === 'battery') return has('battery', false)")) throw new Error('Battery navigation not presence-gated');
if (!app.includes("if(item.id === 'gas') return has('gas', false)")) throw new Error('Gas navigation not presence-gated');
if (!app.includes("if(item.id === 'consumers') return showConsumers")) throw new Error('Consumers navigation not presence-gated');
if (!app.includes("if(item.id === 'value') return showValue")) throw new Error('Value navigation not pricing-presence-gated');
if (!app.includes("presence?.battery === true")) throw new Error('Overview battery surfaces not presence-gated');

console.log('PASS structural capability presence UX');
