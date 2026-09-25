const fs = require('fs');
const vm = require('vm');

const files = [
  'src/runtime/public-interface-registry.js',
  'src/runtime/energy-contract-gateway.js',
  'src/runtime/energy-v2-contract.js',
  'src/runtime/asset-profile-contract.js',
  'src/domain/models/flexible-asset-model.js'
];

const context = {
  console,
  RELEASE_ENTITY: 'sensor.energy_release_contract',
  firstDefined: (...values) => values.find(v => v !== undefined && v !== null),
  parseMaybeJson: (value, fallback = null) => {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value !== 'string') return value;
    try { return JSON.parse(value); } catch { return fallback; }
  },
  asBool: (value, fallback = false) => value === undefined || value === null ? fallback : value === true || value === 'true' || value === 1,
  asNumber: value => value === undefined || value === null || value === '' || !Number.isFinite(Number(value)) ? null : Number(value),
  Object, Array, Map, Set, String, Number, Boolean, JSON, Math
};
vm.createContext(context);
for (const file of files) vm.runInContext(fs.readFileSync(file, 'utf8'), context, {filename:file});
vm.runInContext(
  'globalThis.FlexibleAssetDomainModel = FlexibleAssetDomainModel;'
  + 'globalThis.readEnergyAssetContext = readEnergyAssetContext;'
  + 'globalThis.energyAssetPublicationGap = energyAssetPublicationGap;',
  context
);

const states = {
  'sensor.rhi_energy_public_contract_v2': {
    state:'OK',
    attributes:{
      contract_visibility:'ux_safe',
      contract_id:'RHI_ENERGY_PUBLIC_CONTRACT_V2',
      contract_version:'2.0.0',
      objects:[
        {
          asset_id:'vehicle_test',
          asset_type:'flexible_load',
          profile_id:'energy.flexible_load.mobility',
          participation_state:'participating',
          operating_state:'waiting',
          availability_state:'AVAILABLE',
          property_publication:{
            authority:'RHI_ENERGY_PUBLIC_CONTRACT_V2',
            complete:true,
            resolution_complete:false,
            missing_required_property_keys:[],
            unresolved_required_property_keys:['flexible_load.power_kw'],
            v1_fallback_allowed:false
          }
        },
        {
          asset_id:'battery_test',
          asset_type:'battery',
          profile_id:'energy.battery.solaredge_modbus_multi',
          participation_state:'participating',
          operating_state:'idle',
          availability_state:'AVAILABLE',
          property_publication:{
            authority:'RHI_ENERGY_PUBLIC_CONTRACT_V2',
            complete:true,
            unresolved_required_property_keys:[],
            v1_fallback_allowed:false
          }
        }
      ],
      profiles:[
        {profile_id:'energy.flexible_load.mobility',asset_type:'flexible_load',profile_scope:'domain_asset_type',editable:false},
        {profile_id:'energy.battery.solaredge_modbus_multi',asset_type:'battery',profile_scope:'domain_asset_type',editable:false}
      ]
    }
  }
};

const runtime = {
  state: id => states[id] || null,
  contractGateway() { return context.createEnergyContractGateway(this); },
  planningOutcomeFor() { return null; },
  planningIndexRows() { return []; },
  primaryFlexibleAssets() {
    return [
      {asset_id:'vehicle_test',display_name:'Car that happens to mention Battery in its nickname'},
      {asset_id:'battery_test',display_name:'Storage'}
    ];
  },
  connectedRelationships() { return []; },
  number() { return null; },
  value(_key, fallback) { return fallback; }
};

const vehicleCtx = context.readEnergyAssetContext(runtime.contractGateway(),'vehicle_test');
if (!vehicleCtx.available || vehicleCtx.profile?.asset_type !== 'flexible_load') throw new Error('canonical V2 profile context missing');
const gap = context.energyAssetPublicationGap(runtime.contractGateway(),'vehicle_test');
if (gap.status !== 'complete' || gap.missing.length !== 0 || gap.unresolved[0] !== 'flexible_load.power_kw' || gap.resolution_complete !== false || gap.v1_fallback_allowed !== false) {
  throw new Error('publication/resolution evidence contract lost');
}

const model = new context.FlexibleAssetDomainModel(runtime);
const vehicle = model.byId('vehicle_test');
const battery = model.byId('battery_test');

if (vehicle.isStorage) throw new Error('display-name/storage regex inference reintroduced');
if (vehicle.participation !== 'participating' || vehicle.operation !== 'waiting') throw new Error('backend-owned flexible state not consumed');
if (vehicle.profileId !== 'energy.flexible_load.mobility') throw new Error('profile id not surfaced in domain model');
if (battery.isStorage !== true) throw new Error('canonical battery asset type not recognized as storage');
if (battery.operation !== 'idle') throw new Error('canonical battery operating state not consumed');

const source = fs.readFileSync('src/domain/models/flexible-asset-model.js','utf8');
for (const forbidden of ['/battery|storage/i','> 0.05) return \'active\'','disabled|excluded|not.participating']) {
  if (source.includes(forbidden)) throw new Error('frontend semantic inference remains: '+forbidden);
}

console.log('PASS Energy V2 asset profiles, publication evidence and fail-closed flexible semantics');
