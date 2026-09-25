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
          planning_horizons:{
            D0:{ horizon_id:'D0', summary:{ lane_totals:{ consumers:{ flexible_loads_kwh:3.2, flexible_assets:[] } } }, buckets:[] },
            D1:{ horizon_id:'D1', summary:{ lane_totals:{ consumers:{ flexible_loads_kwh:4.7, flexible_assets:[] } } }, buckets:[] }
          }
        }
      }
    };
  }
};
const d1Contract = readPlanningContract(planningGateway, 'D1');
assert.equal(d1Contract.planningTodayTotals.planned_today_kwh, 3.2);
assert.equal(d1Contract.planningTomorrowTotals.planned_tomorrow_kwh, 4.7);
assert.equal(d1Contract.planningCombinedTotals.planned_horizon_kwh, 7.9);
assert.equal(normalizePlanningLaneTotals(d1Contract.laneTotals).flexibleLoadsKwh, 4.7);

console.log('PASS capability-based canonical lanes and bounded R1.79.3 compatibility');
