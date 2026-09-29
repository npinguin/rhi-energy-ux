'use strict';

const fs = require('fs');
const vm = require('vm');
const assert = require('node:assert/strict');

const context = {
  console,
  Object, Array, Map, Set, String, Number, Boolean, JSON,
  firstDefined: (...values) => values.find(value => value !== undefined && value !== null),
  asNumber: value => value === undefined || value === null || value === '' || Number.isNaN(Number(value)) ? null : Number(value),
  asBool: (value, fallback = false) => value === undefined || value === null ? fallback : Boolean(value),
  readEnergyAssetContext: (_gateway, assetId) => ({
    available:true,
    asset:assetId === 'vehicle_id4' ? {
      asset_id:assetId,
      asset_type:'flexible_load',
      display_name:'VW ID4',
      visual_ref:'energy.logical.flexible_load.generic',
      effective_connection_id:'charger_driveway',
      assigned_connection_id:'charger_driveway',
      physical_connection_id:null,
      physical_identity_proven:false,
      connection_state:'disconnected'
    } : {
      asset_id:assetId,
      asset_type:'flexible_load',
      display_name:'Garage charger projection',
      visual_ref:'energy.logical.flexible_load.generic'
    },
    profile:{ profile_id:'vehicle.default', asset_type:'flexible_load' },
    publication:{ complete:true }
  }),
  energyAssetPublicationGap: () => ({status:'complete',missing:[]}),
  resolveEnergyVisualRef: ref => ref ? ({visual_ref:ref,url:'/asset'}) : null
};
vm.createContext(context);
const source = fs.readFileSync('src/domain/models/flexible-asset-model.js','utf8');
vm.runInContext(source + '\nthis.FlexibleAssetDomainModel=FlexibleAssetDomainModel;', context);

const runtime = {
  contractGateway: () => ({}),
  planningOutcomeFor: id => ({asset_id:id,status:'planned'}),
  primaryFlexibleAssets: () => [{
    asset_id:'vehicle_id4',
    source_asset_kind:'vehicle',
    asset_type:'vehicle',
    participation_state:'participating',
    planning_input_ready:true,
    current_power_kw:0,
    visual_ref:'mobility.vehicle.volkswagen.id4.2024-2026.ev.costa-azul',
    effective_connection_id:'charger_driveway',
    assigned_connection_id:'charger_driveway',
    physical_connection_id:null,
    physical_identity_proven:false,
    connection_state:'disconnected'
  },{
    asset_id:'vehicle_waiting',
    source_asset_kind:'vehicle',
    asset_type:'vehicle',
    participation_state:'participating',
    planning_input_ready:false,
    current_power_kw:0,
    visual_ref:'mobility.vehicle.generic.waiting'
  },{
    asset_id:'charger_driveway',
    source_asset_kind:'charger',
    asset_type:'charger',
    participation_state:'infrastructure_only',
    infrastructure_only:true,
    planning_input_ready:false,
    current_power_kw:0,
    visual_ref:'mobility.charger.wallbox.commander2.white',
    source_context:{mobility:{consumer_fallback:'unassigned_charger'}}
  }],
  planningIndexRows: () => [{asset_id:'vehicle_id4',planned_today_kwh:5.4}],
  connectedRelationships: () => [],
  number: () => null,
  value: (_key, fallback) => fallback
};

const domain = new context.FlexibleAssetDomainModel(runtime);
const asset = domain.all()[0];
assert.equal(asset.raw.display_name,'VW ID4');
assert.equal(asset.raw.effective_connection_id,'charger_driveway');
assert.equal(asset.visualRef,'mobility.vehicle.volkswagen.id4.2024-2026.ev.costa-azul','canonical producer visual_ref must win over generic flexible projection');
assert.equal(asset.raw.current_power_kw,0);
assert.equal(domain.all().length,3);
assert.equal(domain.consumerFacing().length,2,'real vehicles remain consumer-facing even when temporarily not plan-ready');
assert.equal(domain.infrastructure().length,1,'technical charger fallback remains represented as infrastructure');
assert.equal(domain.infrastructure()[0].id,'charger_driveway');
assert.equal(domain.planningParticipants().length,1,'only planning-ready managed consumers are Tactical participants');
assert.equal(domain.consumerFacing().find(vm=>vm.id==='vehicle_waiting').isInfrastructure,false);
assert.equal(domain.planningRows()[0].asset_id,'vehicle_id4');
assert.equal(domain.physicalFlowParticipants()[0].id,'vehicle_id4');
assert.equal(domain.physicalFlowParticipants().length,1,'assigned vehicle remains visible in Flow inventory without being called physically connected');

const card = fs.readFileSync('src/app/energy-card.js','utf8');
assert.ok(card.includes('canonicalConnectionSnapshot(rt)'));
assert.ok(card.includes('rt.publicV2().connections'));
assert.ok(card.includes('rt.connectedRelationships().forEach'));
assert.ok(card.includes('asset.effective_connection_id'));
assert.ok(card.includes('asset.assigned_connection_id'));
assert.ok(card.includes('rt.assets().filter(isCharger)'));
assert.ok(card.includes('No charging topology published'));
assert.ok(card.includes('visual_ref:firstDefined(raw.visual_ref'));
assert.ok(!card.includes('Canonical physical connection telemetry is not published by E0.15.48.'));

const presentation = fs.readFileSync('src/app/presentation.js','utf8');
assert.ok(presentation.includes('gas: "heroes/gas-page-hero-v3.webp"'));
assert.ok(!presentation.includes('gas: "heroes/gas-hero.svg"'));

console.log('PASS flexible asset identity, charger connection projection and Gas hero transport');


const chainMarkers = [
  'flowConsumers(rt, connectionSnapshot',
  'const chargerIds = new Set(',
  'const connectedConsumerIds = new Set(',
  'if (!id || isChargerRow({...row,asset_id:id})) return;',
  'connection.connected_consumer_id',
  'connection.connected_asset_id',
  'visual_ref:firstDefined(asset.visual_ref, connection.connected_consumer_visual_ref',
  'A charger can never become the Physical consumers row'
];
for (const marker of chainMarkers) {
  assert.ok(card.includes(marker), 'missing physical consumer chain invariant: '+marker);
}
assert.ok(card.includes("physicalIdentityProven"), 'Flow must require producer proof of physical vehicle identity');
assert.ok(card.includes("physicalConnectionId"), 'Flow must distinguish physical connection from assignment');
assert.ok(card.includes("consumer.assigned_connection_id"));
assert.ok(card.includes("consumer.physical_connection_id"));
assert.ok(!card.includes("|| ['connected','asset_connected'].includes(connectionState)"), 'charger occupancy must not prove vehicle connection');
console.log('PASS physical consumer rows are connection targets, never charger infrastructure');


assert.ok(card.includes('rows.set(chargerKey, row)'), 'connection identity must be charger-only');
assert.ok(card.includes('if (!chargerKey || rows.has(chargerKey)) return;'), 'duplicate charger materialization must fail closed');
assert.ok(card.includes('relationship.visual_ref, charger.visual_ref'), 'producer visual_ref must outrank Energy-local visual');
assert.ok(!card.includes('rows.set(`${chargerKey}::${consumerKey}`, row)'), 'consumer assignment must not create a second physical connection row');
console.log('PASS one charger row per physical connection and producer visual ownership');


assert.ok(card.includes('assetDomain.consumerFacing()'), 'Operational Planning must use consumer-facing assets');
assert.ok(card.includes('domain.consumerFacing().map'), 'Consumers must use consumer-facing assets');
assert.ok(card.includes('planningParticipants().map'), 'Planning projections must use planning participants');
assert.ok(card.includes('vm?.isInfrastructure'), 'Value/consumer escape hatches must reject infrastructure');
console.log('PASS infrastructure-only charger fallback cannot leak into managed consumer/planning surfaces');


assert.ok(card.includes('const assetTotals = allAssetTotals;'), 'Tactical Planning must keep zero/no-plan participants visible');
assert.ok(!card.includes('const assetTotals = allAssetTotals.filter(item => {'), 'Tactical Planning must not hide valid participants based on non-zero energy');
console.log('PASS Tactical Planning preserves valid zero/no-plan participants');
