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

const legacyOnly = adaptPlanningBucket({
  bucket_id:'D0-H12', duration_minutes:30, solar_forecast_kwh:4.5, base_demand_forecast_kwh:0.5,
  asset_allocations:[{asset_id:'vehicle_carole',planned_power_kw:4,allocation_state:'advisory'}],
  expected_grid_import_kwh:0.2, expected_grid_export_kwh:0.1
}, 'R1.79.3_POWER_FEASIBLE_TWO_DAY_PLANNER_CONTRACT');
assert.equal(legacyOnly.contractSupported, false);
assert.equal(legacyOnly.sources.length, 0);
assert.equal(legacyOnly.consumers.length, 0);
assert.equal(legacyOnly.reason, 'canonical_planning_lanes_not_published');

const noEnergyReconstruction = adaptPlanningBucket({
  bucket_id:'D0-H13', duration_minutes:30,
  advisory_source_lane:[],
  advisory_consumer_lane:[{participant_id:'vehicle_carole',planned_power_kw:4}],
  advisory_boundary_flows:{grid_export_kwh:0},
  advisory_lane_balance_delta_kwh:0
}, 'RHI_ENERGY_PUBLIC_CONTRACT_V2');
assert.equal(noEnergyReconstruction.contractSupported, true);
assert.equal(noEnergyReconstruction.consumers[0].energyKwh, null, 'UX may not derive kWh from kW × time');

const unsupported = adaptPlanningBucket({solar_forecast_kwh:99}, 'R1.80.0_UNKNOWN_CONTRACT');
assert.equal(unsupported.contractSupported, false);
assert.equal(unsupported.sources.length, 0);
assert.equal(unsupported.reason, 'canonical_planning_lanes_not_published');

const fs = require('fs');
const vm = require('vm');
const v2Source = fs.readFileSync('src/runtime/energy-v2-contract.js','utf8');
const planningSource = fs.readFileSync('src/domain/planning/planning-contract.js','utf8');
const planningContext = { firstDefined, asNumber, parseMaybeJson, objectFrom, Object, Array, Map, Set, String, Number, Boolean, JSON };
vm.createContext(planningContext);
vm.runInContext(v2Source + '\n' + planningSource + '\nthis.readPlanningContract=readPlanningContract; this.normalizePlanningLaneTotals=normalizePlanningLaneTotals;', planningContext);
const { readPlanningContract, normalizePlanningLaneTotals } = planningContext;

const planningGateway = {
  contract:key=>{
    if(key!=='publicV2') throw new Error('legacy planning contract access:'+key);
    return {
      entityId:'sensor.rhi_energy_public_contract_v2',
      contractVersion:'2.0.0',
      available:true,
      attributes:{
        contract_id:'RHI_ENERGY_PUBLIC_CONTRACT_V2',
        contract_version:'2.0.0',
        objects:[], profiles:[], relationships:[], commands:[], configuration:{}, intelligence:{}, overview:{}, activity:[], value_accounting:{}, layers:{planning_objects:[]},
        planning:{
          horizons:{
            D0:{ horizon_id:'D0', required_kwh:12.4, planned_kwh:9.8, still_to_plan_kwh:2.6, flexible_required_kwh:5.8, flexible_planned_kwh:3.2, flexible_still_to_plan_kwh:2.6, status:'AVAILABLE', execution_status:'NOT_MEASURED',
              summary:{lane_totals:{sources:{solar_kwh:7.0,battery_out_kwh:1.0,grid_in_kwh:2.0},consumers:{home_kwh:6.8,flexible_loads_kwh:3.2,flexible_assets:[{asset_id:'vehicle_id4',planned_energy_kwh:3.2}]},boundary:{grid_out_kwh:0.0},source_total_kwh:10.0,use_total_kwh:10.0,balance_delta_kwh:0}},
              buckets:[{bucket_id:'D0-H20',start_time:'2026-09-27T20:00:00+02:00',duration_minutes:60,advisory_source_lane:[{participant_id:'grid',planned_supply_kwh:3.9}],advisory_consumer_lane:[{participant_id:'home',planned_demand_kwh:0},{participant_id:'vehicle_id4',planned_demand_kwh:3.9}],advisory_boundary_flows:{grid_export_kwh:0},advisory_lane_balance_delta_kwh:0}] },
            D1:{ horizon_id:'D1', required_kwh:14.1, planned_kwh:11.6, still_to_plan_kwh:2.5, flexible_required_kwh:7.2, flexible_planned_kwh:4.7, flexible_still_to_plan_kwh:2.5, status:'AVAILABLE' }
          }
        }
      }
    };
  }
};
const d1Contract = readPlanningContract(planningGateway, 'D1');
assert.equal(normalizePlanningLaneTotals(d1Contract.planningTodayTotals).flexibleLoadsKwh, 3.2);
assert.equal(normalizePlanningLaneTotals(d1Contract.planningTomorrowTotals).flexibleLoadsKwh, 4.7);
assert.deepEqual(Object.keys(d1Contract.planningCombinedTotals), []);
assert.equal(normalizePlanningLaneTotals(d1Contract.laneTotals).flexibleLoadsKwh, 4.7);

console.log('PASS canonical V2 planning horizons without frontend total derivation');

assert.equal(d1Contract.planningTodayTotals.buckets.length,1);
const d0Contract = readPlanningContract(planningGateway, 'D0');
assert.equal(d0Contract.buckets.length,1,'Tactical buckets must survive Public V2');
const d0LaneTotals = normalizePlanningLaneTotals(d0Contract.laneTotals);
assert.equal(d0LaneTotals.solarKwh,7.0);
assert.equal(d0LaneTotals.gridInKwh,2.0);
assert.equal(d0LaneTotals.homeKwh,6.8);
assert.equal(d0LaneTotals.flexibleLoadsKwh,3.2);
assert.equal(d0LaneTotals.sourceTotalKwh,10.0);
assert.equal(d0LaneTotals.useTotalKwh,10.0);
assert.equal(d0Contract.buckets[0].advisory_consumer_lane[1].participant_id,'vehicle_id4');


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
