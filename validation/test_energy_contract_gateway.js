const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.resolve(__dirname, '..');
const files = [
  'source/modules/runtime/public-interface-registry.js',
  'source/modules/runtime/energy-contract-gateway.js',
  'source/modules/planning/planning-contract.js'
];
const context = {
  RELEASE_ENTITY: 'sensor.energy_release_contract',
  firstDefined: (...values) => values.find(v => v !== undefined && v !== null),
  parseMaybeJson: (value, fallback = null) => {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value !== 'string') return value;
    try { return JSON.parse(value); } catch { return value; }
  },
  asNumber: value => value === undefined || value === null || value === '' || !Number.isFinite(Number(value)) ? null : Number(value),
  console
};
vm.createContext(context);
for (const file of files) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename:file});
const states = {
  'sensor.energy_planning_index': {
    state: 'ready',
    attributes: {
      contract_version: 'R1.89.44_CONTRACT',
      planning_horizons_by_id: {
        D1: {
          summary: { lane_totals: {
            sources: { solar_kwh: 63.7, grid_in_kwh: 0 },
            consumers: { home_kwh: 17, managed_energy_kwh: 44, flexible_assets: [{asset_id:'vehicle_carole', energy_kwh:36.4}] },
            boundary: { grid_out_kwh: 31.368 }
          }},
          buckets: []
        }
      },
      current_action_intent_json: { action_state: 'waiting' }
    }
  }
};
const host = { state: id => states[id] || null };
const gateway = context.createEnergyContractGateway(host);
const contract = context.readPlanningContract(gateway, 'D1');
const totals = context.normalizePlanningLaneTotals(contract.laneTotals);
if (contract.entityId !== 'sensor.energy_planning_index') throw new Error('wrong owner');
if (contract.totalsSource !== 'horizon.summary.lane_totals') throw new Error('wrong totals source');
if (totals.solarKwh !== 63.7 || totals.gridOutKwh !== 31.368) throw new Error('canonical totals lost');
if (totals.gridInKwh !== 0) throw new Error('known zero lost');
if (totals.flexibleAssetsById.vehicle_carole.energy_kwh !== 36.4) throw new Error('asset total lost');
console.log('PASS energy contract gateway and planning contract');
