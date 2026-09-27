const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.resolve(__dirname, '..');
const context = { UX_VERSION:'4.3.0', console };
vm.createContext(context);
for (const file of [
  'src/runtime/mobility-visual-manifest.js',
  'src/runtime/visual-asset-resolver.js'
]) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'), context, {filename:file});

const audi = context.resolveEnergyVisualRef('mobility.vehicle.audi.q8.4m.2024-2026.tfsi-e.mythos-black');
if (!audi || !/vehicle_audi_q8\.png/.test(audi.url) || audi.fallback) throw new Error('Audi Q8 canonical visual_ref did not resolve');
if (!/brightness/.test(audi.filter)) throw new Error('vehicle appearance filter was lost');

const vw = context.resolveEnergyVisualRef('mobility.vehicle.volkswagen.id4.2024-2026.ev.scale-silver');
if (!vw || !/vehicle_vw_id4\.webp/.test(vw.url) || vw.fallback) throw new Error('VW ID4 canonical visual_ref did not resolve');

const bmw = context.resolveEnergyVisualRef('mobility.vehicle.bmw.x1.u11.2025-2026.phev.mineral-white');
if (!bmw || !/vehicle_bmw_x1_phev\.png/.test(bmw.url) || bmw.fallback) throw new Error('BMW X1 canonical visual_ref did not resolve');

const wallbox = context.resolveEnergyVisualRef('mobility.charger.wallbox.commander2.black');
if (!wallbox || !/charger_wallbox_black\.svg/.test(wallbox.url) || wallbox.fallback) throw new Error('Wallbox canonical visual_ref did not resolve');

const peblar = context.resolveEnergyVisualRef('mobility.charger.peblar.business.socket.factory');
if (!peblar || !/charger_peblar\.svg/.test(peblar.url) || peblar.fallback) throw new Error('Peblar canonical visual_ref did not resolve');

if (context.resolveEnergyVisualRef('mobility.vehicle.unknown.future-model')?.fallback !== true) {
  throw new Error('unknown Mobility vehicle must resolve explicitly to generic fallback');
}
if (context.resolveEnergyVisualRef('energy.battery.generic') !== null) {
  throw new Error('resolver must not claim unknown Energy visual refs');
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
  if (!fs.existsSync(path.join(root,file))) throw new Error(`missing packaged visual transport: ${file}`);
}

const manifestSource=fs.readFileSync(path.join(root,'src/runtime/mobility-visual-manifest.js'),'utf8');
if (manifestSource.includes('RHI_ENERGY_MOBILITY_VISUALS') || manifestSource.includes('RHI_ENERGY_MOBILITY_CHARGER_VISUALS')) {
  throw new Error('hand-maintained Mobility identity table returned');
}
const card = fs.readFileSync(path.join(root,'src/app/energy-card.js'),'utf8');
if (!card.includes("visual_ref:firstDefined(raw.visual_ref")) throw new Error('consumer materialization does not preserve producer visual_ref');
if (!card.includes('resolveEnergyVisualRef(consumer.visual_ref)')) throw new Error('consumer flow card is not visual_ref driven');
if (!card.includes('resolveEnergyVisualRef(charger.visual_ref)')) throw new Error('connection card is not visual_ref driven');

console.log('PASS generated cross-domain visual_ref authority and package-local transport');
