const fs = require('fs');
const vm = require('vm');

const bundle = [
  fs.readFileSync('src/runtime/energy-v2-contract.js', 'utf8'),
  fs.readFileSync('src/runtime/command-contract.js', 'utf8'),
  fs.readFileSync('src/runtime/command-action-model.js', 'utf8')
].join('\n');
const helpers = `
const parseMaybeJson = (value, fallback = null) => { if (value === undefined || value === null || value === '') return fallback; if (typeof value !== 'string') return value; try { return JSON.parse(value); } catch { return fallback; } };
const firstDefined = (...values) => values.find(value => value !== undefined && value !== null);
const objectFrom = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const asBool = (value, fallback = false) => { if (value === true || value === false) return value; const s = String(value ?? '').toLowerCase(); if (['true','1','yes','on','ok','ready','active','enabled','available'].includes(s)) return true; if (['false','0','no','off','fail','degraded','blocked','disabled','inactive','unavailable'].includes(s)) return false; return fallback; };
const human = value => String(value || '').replace(/_/g, ' ');
`;
const context = { Object, Array, Map, Set, String, Number, Boolean, JSON };
vm.createContext(context);
vm.runInContext(`${helpers}\n${bundle}\nthis.readEnergyCommandContract=readEnergyCommandContract; this.createCommandActionModel=createCommandActionModel; this.commandActionModelsForAsset=commandActionModelsForAsset;`, context);

const commands = [
  { command_id:'start_vehicle', target_asset_id:'vehicle_nicky', role:'start', command_owner:'Mobility', action_kind:'physical_execution', visible:true, enabled:true, availability:'AVAILABLE', supported:true, label:'Start charging', invoke:{operation_id:'energy.command.execute',service:'rhi_energy.invoke_command',data:{command_id:'start_vehicle',target_asset_id:'vehicle_nicky'}} },
  { command_id:'stop_vehicle', target_asset_id:'vehicle_nicky', role:'stop', visible:false, enabled:false, availability:'BLOCKED', supported:true, label:'Stop charging', invoke:{operation_id:'energy.command.execute',service:'rhi_energy.invoke_command',data:{command_id:'stop_vehicle',target_asset_id:'vehicle_nicky'}} },
  { command_id:'pause_vehicle', target_asset_id:'vehicle_nicky', role:'pause', command_owner:'Energy', action_kind:'planning_participation_control', visible:true, enabled:false, availability:'BLOCKED', supported:true, label:'Pause Energy control', blocked_reason:'Already paused', user_action_text:'Resume Energy control to rejoin planning.', invoke:{operation_id:'energy.command.execute',service:'rhi_energy.invoke_command',data:{command_id:'pause_vehicle',target_asset_id:'vehicle_nicky'}} }
];
const gateway = {
  contract(key) {
    if (key !== 'publicV2') throw new Error(`legacy contract access:${key}`);
    return {
      entityId:'sensor.rhi_energy_public_contract_v2',
      state:'OK',
      available:true,
      contractVersion:'2.0.0',
      attributes:{
        contract_id:'RHI_ENERGY_PUBLIC_CONTRACT_V2',
        contract_version:'2.0.0',
        objects:[],profiles:[],relationships:[],commands,
        planning:{},intelligence:{},overview:{},configuration:{},value_accounting:{},activity:[],layers:{}
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
console.log('PASS command contract and action model are V2-only');
