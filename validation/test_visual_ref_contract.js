const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.resolve(__dirname, '..');
const visualRef = 'mobility.vehicle.volvo.ex30.2027.ev.cloud-blue';
const context = {
  UX_VERSION:'4.3.5',
  console,
  asArray: value => Array.isArray(value) ? value : (value && typeof value === 'object' ? Object.values(value) : []),
  rhiEnergyVisualEntryFromRef: () => null,
  rhiEnergySelectedVisualRef: () => '',
  rhiEnergyDefaultVisualEntry: () => null,
  rhiEnergyVisualRef: () => ''
};
context.hass = {
  states: {
    'sensor.rhi_foundation_visual_asset_registry': {
      state:'1',
      attributes:{
        contract_id:'RHI_VISUAL_ASSET_REGISTRY_V1',
        contract_version:'1.1.0',
        status:'valid',
        entries:[{
          visual_ref:visualRef,
          asset_type:'vehicle',
          owner_domain:'rhi_mobility',
          revision:2,
          variant_keys:['card','detail'],
          presentation:{
            package_id:'rhi-mobility-ux',
            variants:{
              card:'assets/vehicles/vehicle_volvo_ex30.webp',
              detail:'assets/vehicles/vehicle_volvo_ex30.webp'
            }
          }
        }]
      }
    }
  }
};
vm.createContext(context);
for (const file of [
  'src/runtime/visual-registry.js',
  'src/runtime/visual-asset-resolver.js'
]) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'), context, {filename:file});

const resolved = context.resolveEnergyVisualRef(visualRef, context.hass, 'card');
if (!resolved || resolved.owner_domain !== 'rhi_mobility') throw new Error('registered producer visual_ref did not resolve');
if (resolved.url !== '/hacsfiles/rhi-mobility-ux/assets/vehicles/vehicle_volvo_ex30.webp?v=2') {
  throw new Error('registered package-relative presentation locator did not resolve generically');
}
if (context.resolveEnergyVisualRef('mobility.vehicle.unknown.future-model', context.hass, 'card') !== null) {
  throw new Error('unregistered producer visual_ref must fail closed');
}

const source = fs.readFileSync(path.join(root,'src/runtime/visual-asset-resolver.js'),'utf8');
if (/RHI_ENERGY_MOBILITY_ASSET_TRANSPORT|rhiEnergyMobilityVisualEntry/.test(source)) {
  throw new Error('producer-specific Mobility transport mapping returned');
}
if (fs.existsSync(path.join(root,'src/runtime/mobility-visual-manifest.js'))) {
  throw new Error('copied Mobility visual manifest returned to Energy');
}
if (fs.existsSync(path.join(root,'src/assets/mobility'))) {
  throw new Error('copied Mobility visual assets returned to Energy');
}

console.log('PASS Foundation-registry-driven cross-domain visual resolution without Energy product mapping');
