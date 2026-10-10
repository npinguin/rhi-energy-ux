const fs=require('fs');
const app=fs.readFileSync('src/app/energy-card.js','utf8');
const current=fs.readFileSync('src/domain/models/current-energy-view-model.js','utf8');
const v2=fs.readFileSync('src/runtime/energy-v2-contract.js','utf8');
const consumption=fs.readFileSync('src/runtime/consumption-contract.js','utf8');

for(const token of ["gateway.host?.canonicalIndex","rowsForProperty?.(propertyKey)","expectedClass","candidates.length === 1"]) if(!current.includes(token)) throw new Error('missing strict canonical current projection '+token);
if(current.includes('readEnergyPublicV2(') || current.includes('v2.currentField(')) throw new Error('retired V2 current projection is forbidden');
for(const token of ["homeBatteryAggregateCard(rt, system)","data-current-energy-projection=\"battery\"","const currentSolar = this.currentEnergyModel(rt).solar"]) if(!app.includes(token)) throw new Error('screen does not reuse canonical current projection: '+token);
if(app.includes("this.energyDeviceStatusCard(rt,system,'Battery system')")) throw new Error('Solar has parallel Home Battery semantic path');
for(const forbidden of [
  "rt.number('battery.power_kw')","rt.number('battery.soc_pct')","rt.number('solar.power_kw')",
  "rt.number('grid.net_power_kw')","rt.number('site_consumption.power_kw')","rt.number('home_consumption.power_kw')",
  "rt.value('battery.reserve_target_pct'"
]) if(app.includes(forbidden)) throw new Error('screen bypasses canonical current projection: '+forbidden);
if(!consumption.includes("v2.currentField('site_consumption.power_kw')") || !consumption.includes("v2.currentField('home_consumption.power_kw')")) throw new Error('consumption uses parallel current path');
if(!app.includes("return physical === null ? null : Math.abs(physical);")) throw new Error('Flexible power may not be reconstructed from participant rows');
console.log('PASS one canonical current Energy projection drives all current-value surfaces');
