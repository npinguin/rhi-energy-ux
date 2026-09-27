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
    asset:{
      asset_id:assetId,
      asset_type:'flexible_load',
      display_name:'VW ID4',
      visual_ref:'mobility.vehicle.volkswagen.id4.2024-2026.ev.costa-azul',
      effective_connection_id:'charger_driveway',
      assigned_connection_id:'charger_driveway',
      connection_state:'asset_connected'
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
    participation_state:'participating',
    current_power_kw:0,
    visual_ref:'energy.flexible_load.generic'
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
assert.equal(domain.planningRows()[0].asset_id,'vehicle_id4');
assert.equal(domain.physicalFlowParticipants()[0].id,'vehicle_id4');
assert.equal(domain.physicalFlowParticipants().length,1,'charger-linked idle vehicle must remain in physical topology');

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
assert.ok(card.includes("['connected','asset_connected'].includes(connectionState)"), 'asset_connected must be treated as connected');
assert.ok(card.includes('consumer.effective_connection_id'));
assert.ok(card.includes('consumer.assigned_connection_id'));
assert.ok(card.includes('consumer.physical_connection_id'));
console.log('PASS physical consumer rows are connection targets, never charger infrastructure');


assert.ok(card.includes('rows.set(chargerKey, row)'), 'connection identity must be charger-only');
assert.ok(card.includes('if (!chargerKey || rows.has(chargerKey)) return;'), 'duplicate charger materialization must fail closed');
assert.ok(card.includes('relationship.visual_ref, charger.visual_ref'), 'producer visual_ref must outrank Energy-local visual');
assert.ok(!card.includes('rows.set(`${chargerKey}::${consumerKey}`, row)'), 'consumer assignment must not create a second physical connection row');
console.log('PASS one charger row per physical connection and producer visual ownership');
