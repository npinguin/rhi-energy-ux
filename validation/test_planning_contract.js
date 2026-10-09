'use strict';

global.firstDefined = (...values) => values.find(value => value !== undefined && value !== null);
global.asNumber = value => value === undefined || value === null || value === '' || Number.isNaN(Number(value)) ? null : Number(value);
global.parseMaybeJson = (value, fallback) => {
  if (typeof value !== 'string') return value ?? fallback;
  try { return JSON.parse(value); } catch { return fallback; }
};
global.objectFrom = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};

const { adaptPlanningBucket } = require('../src/domain/planning/contract-adapter.js');
const assert = require('node:assert/strict');

const canonical = adaptPlanningBucket({
  bucket_id:'D0-H10', start_time:'2026-07-24T11:00:00+02:00', duration_minutes:60,
  advisory_source_lane:[
    {participant_id:'solar',planned_supply_kwh:3.713,planning_state:'forecast'},
    {participant_id:'grid',planned_supply_kwh:0,planning_state:'not_required'}
  ],
  advisory_consumer_lane:[
    {participant_id:'home',planned_demand_kwh:0.782,planning_state:'forecast'},
    {participant_id:'vehicle_nicky',planned_demand_kwh:2.86,planned_power_kw:2.86,allocation_state:'advisory',plan_execution_allowed:false}
  ],
  advisory_boundary_flows:{grid_export_kwh:0.071}, advisory_lane_balance_delta_kwh:0
}, 'R1.79.4_PLANNING_ENERGY_LANES_CANDIDATE_CONTRACT');
assert.equal(canonical.canonicalLanes, true);
assert.equal(canonical.sources.find(row => row.participantId === 'solar').energyKwh, 3.713);
assert.equal(canonical.consumers.find(row => row.participantId === 'home').energyKwh, 0.782);
assert.equal(canonical.consumers.find(row => row.participantId === 'vehicle_nicky').executionAllowed, false);
assert.equal(canonical.boundary.gridExportKwh, 0.071);
assert.equal(canonical.balanceDeltaKwh, 0);

const canonicalR1795 = adaptPlanningBucket({
  bucket_id:'D0-H10', duration_minutes:60,
  advisory_source_lane:[{participant_id:'solar',planned_supply_kwh:3.713}],
  advisory_consumer_lane:[{participant_id:'home',planned_demand_kwh:0.782}],
  advisory_boundary_flows:{grid_export_kwh:2.931}, advisory_lane_balance_delta_kwh:0
}, 'R1.79.5_PLANNING_ENERGY_LANES_CONTRACT');
assert.equal(canonicalR1795.contractSupported, true);
assert.equal(canonicalR1795.canonicalLanes, true);
assert.equal(canonicalR1795.sources[0].energyKwh, 3.713);

const futureCanonical = adaptPlanningBucket({
  bucket_id:'D0-H14', duration_minutes:60,
  advisory_source_lane:[], advisory_consumer_lane:[],
  advisory_boundary_flows:{grid_export_kwh:0}, advisory_lane_balance_delta_kwh:0
}, 'R2.0.0_FUTURE_RELEASE');
assert.equal(futureCanonical.contractSupported, true);
assert.equal(futureCanonical.canonicalLanes, true);
assert.equal(futureCanonical.sources.length, 0);

const nullSafe = adaptPlanningBucket({
  bucket_id:'D0-H11', start_time:'2026-10-25T02:00:00+02:00', duration_minutes:60,
  advisory_source_lane:[{participant_id:'solar',planned_supply_kwh:null}],
  advisory_consumer_lane:[{participant_id:'home',planned_demand_kwh:0}],
  advisory_boundary_flows:{grid_import_kwh:0,grid_export_kwh:null},
  advisory_lane_balance_delta_kwh:null
}, 'R1.79.4_PLANNING_ENERGY_LANES_CANDIDATE_CONTRACT');
assert.equal(nullSafe.startTime, '2026-10-25T02:00:00+02:00');
assert.equal(nullSafe.sources.find(row => row.participantId === 'solar').energyKwh, null);
assert.equal(nullSafe.consumers.find(row => row.participantId === 'home').energyKwh, 0);
assert.equal(nullSafe.boundary.gridExportKwh, null);
assert.equal(nullSafe.balanceDeltaKwh, null);

const compatible = adaptPlanningBucket({
  bucket_id:'D0-H12', duration_minutes:30, solar_forecast_kwh:4.5, base_demand_forecast_kwh:0.5,
  asset_allocations:[{asset_id:'vehicle_carole',planned_power_kw:4,allocation_state:'advisory'}],
  expected_grid_import_kwh:0.2, expected_grid_export_kwh:0.1
}, 'R1.79.3_POWER_FEASIBLE_TWO_DAY_PLANNER_CONTRACT');
assert.equal(compatible.canonicalLanes, false);
assert.equal(compatible.sources.find(row => row.participantId === 'solar').energyKwh, 4.5);
assert.equal(compatible.consumers.find(row => row.participantId === 'home').energyKwh, 0.5);
assert.equal(compatible.consumers.find(row => row.participantId === 'vehicle_carole').energyKwh, 2);
assert.equal(compatible.sources.find(row => row.participantId === 'grid').energyKwh, 0.2);
assert.equal(compatible.boundary.gridExportKwh, 0.1);
const signedGrid = adaptPlanningBucket({
  bucket_id:'D0-H13', duration_minutes:60, grid_net_kwh:-1.25
}, 'R1.79.3_POWER_FEASIBLE_TWO_DAY_PLANNER_CONTRACT');
assert.equal(signedGrid.sources.find(row => row.participantId === 'grid').energyKwh, 0);
assert.equal(signedGrid.boundary.gridExportKwh, 1.25);
const unsupported = adaptPlanningBucket({solar_forecast_kwh:99}, 'R1.80.0_UNKNOWN_CONTRACT');
assert.equal(unsupported.contractSupported, false);
assert.equal(unsupported.sources.length, 0);
assert.equal(unsupported.reason, 'unsupported_planning_contract');

const fs = require('fs');
const vm = require('vm');
const v2Source = fs.readFileSync('src/runtime/energy-v2-contract.js','utf8');
const planningSource = fs.readFileSync('src/domain/planning/planning-contract.js','utf8');
const planningContext = { firstDefined, asNumber, parseMaybeJson, objectFrom, Object, Array, Map, Set, String, Number, Boolean, JSON };
vm.createContext(planningContext);
vm.runInContext(planningSource + '\nthis.readPlanningContract=readPlanningContract; this.normalizePlanningLaneTotals=normalizePlanningLaneTotals;', planningContext);
const { readPlanningContract, normalizePlanningLaneTotals } = planningContext;

const mk=(key, value, available=true)=>({available,value:available?String(value):null,metric_key:key});
const keys=['required_kwh','planned_kwh','still_to_plan_kwh','flexible_required_kwh','flexible_planned_kwh','flexible_still_to_plan_kwh'];
const runtime={
  nativePlanningTotals(horizon){
    const vals=Object.fromEntries(keys.map((key,i)=>[key,mk(key,i===0?0:i+1)]));
    return {available:true,horizon,values:vals,missing:[]};
  }
};
const d0Contract=readPlanningContract(runtime,'D0');
const d1Contract=readPlanningContract(runtime,'D1');
const unsupportedHorizon=readPlanningContract(runtime,'D2');
assert.equal(unsupportedHorizon.available,false);
assert.equal(unsupportedHorizon.horizon.status,'INCOMPLETE');
assert.ok(unsupportedHorizon.horizon.quality.missing.includes('unsupported_planning_horizon'));
assert.equal(unsupportedHorizon.horizon.required_kwh,undefined);

assert.equal(d0Contract.contractVersion,'ENERGY_NATIVE_PLANNING');
assert.equal(d0Contract.totalsSource,'rhi_energy.runtime/native_metric');
assert.equal(d0Contract.planningTodayTotals.required_kwh,0);
assert.equal(d1Contract.planningTomorrowTotals.flexible_planned_kwh,5);
assert.equal(d0Contract.buckets.length,0);
const nativeBucket={bucket_id:'D0-H12',asset_allocations:[{asset_id:'vehicle_carole',planned_energy_kwh:2}]};
const withNativeDetail={
  ...runtime,
  nativePlanningHorizon(horizon){return {available:horizon==='D0',details:horizon==='D0'
    ? {buckets:[nativeBucket],planning_assets:[{asset_id:'vehicle_carole',planned_today_kwh:2}],availability:'AVAILABLE'} : null};}
};
const publishedD0=readPlanningContract(withNativeDetail,'D0');
assert.equal(publishedD0.buckets.length,1);
assert.equal(publishedD0.planningAssets.length,1);
assert.equal(publishedD0.planningAssetsById.vehicle_carole.planned_today_kwh,2);
assert.equal(publishedD0.missingContractCapabilities.includes('native_planning_assets'),false);
assert.equal(publishedD0.buckets[0].asset_allocations[0].planned_energy_kwh,2);
assert.equal(publishedD0.missingContractCapabilities.includes('native_planning_buckets'),false);
assert.equal(readPlanningContract(withNativeDetail,'D1').buckets.length,0);

assert.equal(d0Contract.planningAssets.length,0);
assert.ok(d0Contract.missingContractCapabilities.includes('native_planning_buckets'));
assert.deepEqual(Object.keys(d0Contract.planningCombinedTotals),[]);
assert.equal(normalizePlanningLaneTotals(d1Contract.laneTotals).flexibleLoadsKwh,5);
const unavailableRuntime={nativePlanningTotals(horizon){
  const data=runtime.nativePlanningTotals(horizon);
  return {available:false,horizon,values:{...data.values,planned_kwh:mk('planned_kwh',null,false)},missing:['planned_kwh']};
}};
const unavailableContract=readPlanningContract(unavailableRuntime,'D0');
assert.equal(unavailableContract.available,false);
assert.equal(unavailableContract.laneTotals.planned_kwh,null);
assert.equal(unavailableContract.horizon.status,'INCOMPLETE');
console.log('PASS native Energy D0/D1 planning reader with explicit missing capabilities, zero and unavailable');


const card = fs.readFileSync('src/app/energy-card.js','utf8');
for (const token of [
  "automationExecutionPolicy(rt)",
  "autonomous_execution_allowed",
  "manual_plan_execution_allowed",
  "Advice · plan waits for your approval",
  "Disabled · planning is informational only",
  "Apply current plan",
  "rt.value('energy_intelligence.automation_mode','advice')"
]) if (!card.includes(token)) throw new Error('missing automation authority UX invariant '+token);

for (const forbidden of [
  "rt.value('energy_intelligence.automation_mode','automatic')",
  "automationModeValue(rt, fallback = 'Automatic')"
]) if (card.includes(forbidden)) throw new Error('unsafe Automatic fallback remains '+forbidden);

console.log('PASS Advice / Automatic / Disabled execution-authority UX contract');


// Native metric evidence must reject malformed numeric states even when HA reports AVAILABLE.
const nativeMetricContext = {Object,Array,Map,Set,String,Number,Boolean,JSON};
vm.createContext(nativeMetricContext);
vm.runInContext(fs.readFileSync('src/runtime/canonical-property-index.js','utf8') +
  '\nthis.readNativeEnergyMetric=readNativeEnergyMetric;', nativeMetricContext);
const readMetric=nativeMetricContext.readNativeEnergyMetric;
const metricState=(value, availability='AVAILABLE')=>({
  'sensor.metric':{state:value,attributes:{metric_key:'planning_today_required_kwh',
    canonical_source:'rhi_energy.runtime',availability}}
});
assert.equal(readMetric({states:metricState('0')},'planning_today_required_kwh').available,true);
assert.equal(readMetric({states:metricState('0')},'planning_today_required_kwh').value,'0');
for (const invalid of ['NaN','Infinity','-Infinity','garbage','','unknown','unavailable']) {
  const result=readMetric({states:metricState(invalid)},'planning_today_required_kwh');
  assert.equal(result.available,false,'must reject invalid native metric '+invalid);
  assert.equal(result.value,null);
}
assert.equal(readMetric({states:metricState('17.5','STALE')},'planning_today_required_kwh').available,false);
console.log('PASS native metric numeric integrity, zero and availability');
