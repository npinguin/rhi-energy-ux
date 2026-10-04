const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.resolve(__dirname, '..');
const context = {
  UX_VERSION:'4.3.5',
  console,
  parseMaybeJson:(value,fallback=null)=>{
    if(value===undefined||value===null||value==='') return fallback;
    if(typeof value!=='string') return value;
    try{return JSON.parse(value);}catch{return fallback;}
  },
  rhiEnergyVisualEntryFromRef:()=>null,
  rhiEnergySelectedVisualRef:()=>"",
  rhiEnergyDefaultVisualEntry:()=>null,
  rhiEnergyVisualRef:()=>"",
};
vm.createContext(context);
for (const file of [
  'src/runtime/foundation-visual-registry.js',
  'src/runtime/visual-asset-resolver.js'
]) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'), context, {filename:file});

const registryState = {
  state:'2',
  attributes:{
    contract_id:'RHI_VISUAL_ASSET_REGISTRY_V2',
    contract_version:'2.0.0',
    status:'valid',
    entries:[
      {
        visual_ref:'mobility.vehicle.future.synthetic-model.blue',
        asset_type:'vehicle',
        owner_domain:'rhi_mobility',
        revision:7,
        variant_keys:['card','detail'],
        presentation:{
          package_id:'rhi-mobility-ux',
          variants:{
            card:'assets/vehicles/future-synthetic.webp',
            detail:'assets/vehicles/future-synthetic.webp'
          }
        }
      },
      {
        visual_ref:'mobility.charger.future.synthetic-model',
        asset_type:'charger',
        owner_domain:'rhi_mobility',
        revision:2,
        variant_keys:['card'],
        presentation:{
          package_id:'rhi-mobility-ux',
          variants:{card:'assets/chargers/future-synthetic.webp'}
        }
      }
    ]
  }
};
const registry = context.readFoundationVisualRegistry({states:{'sensor.any_user_visible_id':registryState}});
const futureVehicle = context.resolveEnergyVisualRef('mobility.vehicle.future.synthetic-model.blue', registry, 'card');
if (!futureVehicle || futureVehicle.owner_domain !== 'rhi_mobility') throw new Error('registered producer ref did not resolve');
if (futureVehicle.url !== '/hacsfiles/rhi-mobility-ux/assets/vehicles/future-synthetic.webp?r=7') throw new Error('registered package-relative presentation locator is incorrect');
const futureCharger = context.resolveEnergyVisualRef('mobility.charger.future.synthetic-model', registry, 'card');
if (!futureCharger || !futureCharger.url.includes('/rhi-mobility-ux/assets/chargers/future-synthetic.webp')) throw new Error('registered charger ref did not resolve');
if (context.resolveEnergyVisualRef('mobility.vehicle.not.registered', registry, 'card') !== null) throw new Error('unregistered producer ref must fail closed to neutral caller fallback');

const badRegistry = {
  available:true,
  entry:()=>({
    visual_ref:'mobility.vehicle.bad',
    owner_domain:'rhi_mobility',
    asset_type:'vehicle',
    revision:1,
    presentation:{package_id:'rhi-mobility-ux',variants:{card:'../escape.webp'}}
  })
};
if (context.resolveEnergyVisualRef('mobility.vehicle.bad', badRegistry, 'card') !== null) throw new Error('unsafe registry path must fail closed');

const manifest = fs.readFileSync(path.join(root,'src/manifest.json'),'utf8');
if (manifest.includes('mobility-visual-manifest.js')) throw new Error('Energy build still imports Mobility visual manifest');
if (fs.existsSync(path.join(root,'src/runtime/mobility-visual-manifest.js'))) throw new Error('hardcoded Mobility visual manifest remains');
if (fs.existsSync(path.join(root,'src/assets/mobility'))) throw new Error('copied Mobility asset catalog remains in Energy source');

const resolver = fs.readFileSync(path.join(root,'src/runtime/visual-asset-resolver.js'),'utf8');
for (const forbidden of ['RHI_ENERGY_MOBILITY_ASSET_TRANSPORT','vehicle_vw_id4','vehicle_audi_q8','charger_wallbox','Volkswagen','Audi','Peblar']) {
  if (resolver.includes(forbidden)) throw new Error('producer-specific Energy resolver knowledge returned: '+forbidden);
}

console.log('PASS Foundation-registry-driven cross-domain visual resolution');
