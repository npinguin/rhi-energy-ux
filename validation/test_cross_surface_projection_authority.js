const fs=require('fs');
const app=fs.readFileSync('src/app/energy-card.js','utf8');
const current=fs.readFileSync('src/domain/models/current-energy-view-model.js','utf8');
const v2=fs.readFileSync('src/runtime/energy-v2-contract.js','utf8');
const consumption=fs.readFileSync('src/runtime/consumption-contract.js','utf8');
const selectors=fs.readFileSync('src/domain/selectors/energy-selectors.js','utf8');

for(const token of [
  "battery:['battery_system','home_battery_system']",
  "solar:['solar_production']",
  "grid:['grid_connection']",
  "consumption:['site_consumption']",
  "home:['home_consumption']",
  "v2.aggregateField(authority[String(interfaceKey || '')] || [], propertyKey)"
]) if(!current.includes(token)) throw new Error('current projection missing '+token);

for(const forbidden of [
  "rt.number('flexible_loads.power_kw')",
  "rt.number('battery.power_kw')",
  "rt.number('battery.soc_pct')",
  "rt.number('solar.power_kw')",
  "rt.number('grid.net_power_kw')",
  "rt.number('site_consumption.power_kw')",
  "this.energyDeviceStatusCard(rt,system,'Battery system')"
]) if(app.includes(forbidden)) throw new Error('screen semantic bypass: '+forbidden);

for(const token of [
  "homeBatteryAggregateCard(rt, system)",
  'data-current-energy-projection="battery"',
  "const solarToday = current.solar.energyTodayKwh;",
  "const reserve = batteryVm.reserveTargetPct;",
  "rt.planningHorizonTotals('D0')",
  "return value === null ? null : Math.abs(value);",
  "rt.gasProjection()"
]) if(!app.includes(token)) throw new Error('cross-surface projection invariant missing '+token);

for(const token of [
  "v2.aggregateField(['site_consumption'], 'site_consumption.power_kw')",
  "v2.aggregateField(['home_consumption'], 'home_consumption.power_kw')",
  "v2.aggregateField(['flexible_loads','flexible_load_aggregate'], 'flexible_loads.power_kw')"
]) if(!consumption.includes(token)) throw new Error('consumption bypass '+token);

if(!selectors.includes('function selectEnergyGas(store)')) throw new Error('Gas selector missing');
if(app.includes("properties.find(row => String(row?.property_key || '') === key)")) throw new Error('Gas screen still parses raw asset properties');

console.log('PASS one canonical Energy projection path across Overview/Flow/Solar/Battery/Consumption/Gas/Planning');
