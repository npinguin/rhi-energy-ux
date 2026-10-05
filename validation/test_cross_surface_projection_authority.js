const fs=require('fs');

const app=fs.readFileSync('src/app/energy-card.js','utf8');
const current=fs.readFileSync('src/domain/models/current-energy-view-model.js','utf8');
const v2=fs.readFileSync('src/runtime/energy-v2-contract.js','utf8');
const consumption=fs.readFileSync('src/runtime/consumption-contract.js','utf8');

for(const token of [
  "aggregateField(authority[String(interfaceKey || '')] || [], propertyKey)",
  "battery:['battery_system','home_battery_system']",
  "solar:['solar_production']",
  "grid:['grid_connection']",
  "consumption:['site_consumption']",
  "home:['home_consumption']"
]) if(!current.includes(token)) throw new Error('current projection missing '+token);

for(const token of [
  "'battery.power_kw':['power_kw','current_power_kw','actual_power_kw','battery_power_kw']",
  "'solar.power_kw':['power_kw','current_power_kw','solar_power_kw']",
  "'grid.net_power_kw':['net_power_kw','power_kw']",
  "'site_consumption.power_kw':['power_kw','current_power_kw','site_consumption_kw']",
  "'home_consumption.power_kw':['power_kw','current_power_kw','home_consumption_kw']"
]) if(!v2.includes(token)) throw new Error('aggregate V2 alias missing '+token);

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
  "rt.value('battery.power_kw'",
  "rt.value('battery.soc_pct'",
  "rt.value('solar.power_kw'",
  "rt.value('grid.net_power_kw'",
  "rt.value('site_consumption.power_kw'",
  "rt.value('home_consumption.power_kw'"
]) if(app.includes(forbidden)) throw new Error('screen bypasses current projection: '+forbidden);

for(const token of [
  "canonicalLiveEnergyBalance(rt)",
  "const current = this.currentEnergyModel(rt);",
  "homeBatteryAggregateCard(rt, system)",
  "data-current-energy-projection=\"battery\"",
  "const solarToday = current.solar.energyTodayKwh;",
  "const reserve = batteryVm.reserveTargetPct;",
  "return this.currentEnergyModel(rt).consumption.flexibleLoadsKw"
]) if(!app.includes(token)) throw new Error('cross-surface projection invariant missing '+token);

if(app.includes("this.energyDeviceStatusCard(rt,system,'Battery system')")) throw new Error('Solar keeps an independent Battery aggregate path');
if(app.includes("gasTotalEntityId()")) throw new Error('Gas renderer rediscovered HA entity truth');

for(const token of [
  "v2.aggregateField(['site_consumption'], 'site_consumption.power_kw')",
  "v2.aggregateField(['home_consumption'], 'home_consumption.power_kw')"
]) if(!consumption.includes(token)) throw new Error('consumption projection does not share aggregate resolver: '+token);

console.log('PASS Energy cross-surface product truth has one canonical projection path');
