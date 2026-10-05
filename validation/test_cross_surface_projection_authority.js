const fs=require('fs');

const app=fs.readFileSync('src/app/energy-card.js','utf8');
const current=fs.readFileSync('src/domain/models/current-energy-view-model.js','utf8');
const v2=fs.readFileSync('src/runtime/energy-v2-contract.js','utf8');
const consumption=fs.readFileSync('src/runtime/consumption-contract.js','utf8');

for(const token of [
  'const assetFieldAliases = Object.freeze({',
  'const assetField = (assetId, key) =>',
  'const currentAuthority = Object.freeze({',
  'const canonicalField = key =>',
  'assetField,',
  'canonicalField,'
]) if(!v2.includes(token)) throw new Error('V2 canonical projection missing '+token);

for(const token of [
  "'battery.power_kw':['battery.power_kw','power_kw','current_power_kw','actual_power_kw','battery_power_kw']",
  "'solar.power_kw':['solar.power_kw','power_kw','current_power_kw','actual_power_kw','solar_power_kw']",
  "'grid.net_power_kw':['grid.net_power_kw','net_power_kw','power_kw']",
  "'site_consumption.power_kw':['site_consumption.power_kw','consumption.power_kw','power_kw','current_power_kw','site_consumption_kw']",
  "'home_consumption.power_kw':['home_consumption.power_kw','consumption.power_kw','power_kw','current_power_kw','home_consumption_kw']"
]) if(!v2.includes(token)) throw new Error('canonical alias family missing '+token);

if(!current.includes('const projected = v2.canonicalField(propertyKey);')) throw new Error('current-energy model bypasses canonicalField()');
if(!consumption.includes("v2.canonicalField('site_consumption.power_kw')")) throw new Error('site consumption bypasses canonicalField()');
if(!consumption.includes("v2.canonicalField('home_consumption.power_kw')")) throw new Error('home consumption bypasses canonicalField()');

for(const forbidden of [
  "rt.number('battery.power_kw')",
  "rt.number('battery.soc_pct')",
  "rt.number('battery.available_kwh')",
  "rt.number('battery.capacity_kwh')",
  "rt.number('solar.power_kw')",
  "rt.number('grid.net_power_kw')",
  "rt.number('grid_import.power_kw')",
  "rt.number('grid_export.power_kw')",
  "rt.number('site_consumption.power_kw')",
  "rt.number('home_consumption.power_kw')",
  "this.energyDeviceStatusCard(rt,system,'Battery system')"
]) if(app.includes(forbidden)) throw new Error('screen owns duplicate current-energy path: '+forbidden);

for(const token of [
  'canonicalLiveEnergyBalance(rt)',
  'const current = this.currentEnergyModel(rt);',
  'homeBatteryAggregateCard(rt, system)',
  'data-current-energy-projection="battery"',
  'const reserve = batteryVm.reserveTargetPct;',
  'return physical === null ? null : Math.abs(physical);'
]) if(!app.includes(token)) throw new Error('cross-surface convergence invariant missing '+token);

const factsStart=app.indexOf('    energyAssetFacts(rt, asset = {}, limit = 4) {');
const factsEnd=app.indexOf('\n    energyAssetAreaLabel',factsStart);
const facts=app.slice(factsStart,factsEnd);
if(/valueAtPath\(asset, path\)/.test(facts)) throw new Error('asset cards still have raw-object semantic fallback outside V2 adapter');

console.log('PASS Energy Overview/Flow/Solar/Battery/Consumption/asset cards share canonical V2 semantic projection');
