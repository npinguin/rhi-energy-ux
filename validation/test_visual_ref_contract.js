const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.resolve(__dirname, '..');
const context = { UX_VERSION:'3.96.1', console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'src/runtime/visual-asset-resolver.js'),'utf8'), context);

const audi = context.resolveEnergyVisualRef('mobility.vehicle.audi.q8.4m.2024-2026.tfsi-e.mythos-black');
if (!audi || !/vehicle_audi_q8\.png/.test(audi.url)) throw new Error('Audi Q8 visual_ref did not resolve');
if (!/brightness/.test(audi.filter)) throw new Error('vehicle appearance filter was lost');

const wallbox = context.resolveEnergyVisualRef('mobility.charger.wallbox.commander2.black');
if (!wallbox || !/charger_wallbox_black\.svg/.test(wallbox.url)) throw new Error('Wallbox visual_ref did not resolve');

if (context.resolveEnergyVisualRef('mobility.vehicle.unknown.future-model')?.fallback !== true) {
  throw new Error('unknown Mobility vehicle must resolve explicitly to generic fallback');
}
if (context.resolveEnergyVisualRef('energy.battery.generic') !== null) {
  throw new Error('resolver must not claim other domain visual namespaces');
}

for (const file of [
  'src/assets/mobility/vehicle_audi_q8.png',
  'src/assets/mobility/vehicle_bmw_x1_phev.png',
  'src/assets/mobility/vehicle_mercedes_gla.png',
  'src/assets/mobility/vehicle_renault_scenic_techno_ev.webp',
  'src/assets/mobility/vehicle_vw_id4.webp',
  'src/assets/mobility/vehicle_fallback.png',
  'src/assets/mobility/charger_wallbox_white.svg',
  'src/assets/mobility/charger_wallbox_black.svg',
  'src/assets/mobility/charger_peblar.svg',
  'src/assets/mobility/charger_utility_plug.svg',
  'src/assets/mobility/charger_fallback.png'
]) {
  if (!fs.existsSync(path.join(root,file))) throw new Error(`missing packaged visual: ${file}`);
}

const card = fs.readFileSync(path.join(root,'src/app/energy-card.js'),'utf8');
if (!card.includes('resolveEnergyVisualRef(consumer.visual_ref)')) throw new Error('consumer card is not visual_ref driven');
if (!card.includes('resolveEnergyVisualRef(charger.visual_ref)')) throw new Error('connection card is not visual_ref driven');

console.log('PASS cross-domain visual_ref resolution');
