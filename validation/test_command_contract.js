const fs = require('fs');
const vm = require('vm');

const bundle = fs.readFileSync('source/homebrain-energy-card.js', 'utf8');
const start = bundle.indexOf('// BEGIN GENERATED MODULE: runtime/command-contract.js');
const end = bundle.indexOf('// END GENERATED MODULE: runtime/command-action-model.js') + '// END GENERATED MODULE: runtime/command-action-model.js'.length;
if (start < 0 || end < 0) throw new Error('Command modules not found');
const helpers = `
const parseMaybeJson = (value, fallback = null) => { if (value === undefined || value === null || value === '') return fallback; if (typeof value !== 'string') return value; try { return JSON.parse(value); } catch { return value; } };
const firstDefined = (...values) => values.find(value => value !== undefined && value !== null);
const objectFrom = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const asBool = (value, fallback = false) => { if (value === true || value === false) return value; const s = String(value ?? '').toLowerCase(); if (['true','1','yes','on','ok','ready','active','enabled','available'].includes(s)) return true; if (['false','0','no','off','fail','degraded','blocked','disabled','inactive','unavailable'].includes(s)) return false; return fallback; };
const human = value => String(value || '').replace(/_/g, ' ');
`;
const context = {};
vm.createContext(context);
vm.runInContext(`${helpers}\n${bundle.slice(start, end)}\nthis.readEnergyCommandContract=readEnergyCommandContract; this.createCommandActionModel=createCommandActionModel; this.commandActionModelsForAsset=commandActionModelsForAsset;`, context);

const gateway = {
  contract() {
    return {
      entityId: 'sensor.energy_command_index',
      attributes: {
        commands_json: [
          { command_id:'start_vehicle', target_asset_id:'vehicle_nicky', role:'start', command_owner:'Mobility', action_kind:'physical_execution', visible:true, enabled:true, label:'Start charging', invoke:{operation_id:'energy.command.execute'} },
          { command_id:'stop_vehicle', target_asset_id:'vehicle_nicky', role:'stop', visible:false, enabled:false, label:'Stop charging', invoke:{operation_id:'energy.command.execute'} },
          { command_id:'pause_vehicle', target_asset_id:'vehicle_nicky', role:'pause', command_owner:'Energy', action_kind:'planning_participation_control', visible:true, enabled:false, label:'Pause Energy control', blocked_reason:'Already paused', user_action_text:'Resume Energy control to rejoin planning.', invoke:{operation_id:'energy.command.execute'} }
        ]
      }
    };
  }
};
const contract = context.readEnergyCommandContract(gateway);
const actions = context.commandActionModelsForAsset(contract, 'vehicle_nicky');
if (actions.length !== 2) throw new Error(`Expected hidden action removed, got ${actions.length}`);
if (!actions.find(a => a.role === 'start' && a.enabled && a.label === 'Start charging' && a.owner === 'Mobility')) throw new Error('Start action normalization failed');
if (!actions.find(a => a.role === 'pause' && !a.enabled && a.reason === 'Already paused' && a.label === 'Pause Energy control' && a.owner === 'Energy')) throw new Error('Pause action normalization failed');
if (actions.find(a => a.role === 'stop')) throw new Error('ux_visible=false stop must not be rendered');
console.log('PASS command contract and action model');
