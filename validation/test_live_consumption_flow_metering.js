const fs=require('fs');
const src=fs.readFileSync('dist/rhi-energy-ux.js','utf8');

for (const token of [
  'site_consumption.power_kw',
  'home_consumption.power_kw',
  'flexible_loads.power_kw',
  'readLiveConsumptionContract',
  'buildPhysicalFlowViewModel',
  'createMeteringStatusModel',
  'selectEnergyMetering',
  'RHI_ENERGY_PUBLIC_CONTRACT_V2'
]) if(!src.includes(token)) throw new Error('missing '+token);

for (const forbidden of [
  'home_base_load.power_kw',
  'total_non_storage_demand',
  'total_site_demand',
  'sensor.energy_connection_property_index',
  'sensor.energy_connection_fact_registry',
  'energy_intelligence.usable_surplus_kw'
]) if(src.includes(forbidden)) throw new Error('forbidden '+forbidden);

if (!/ATTRIBUTION_PENDING:\s*'Waiting for trusted meter attribution'/.test(src)) throw new Error('pending mapping missing');
if (!/NOT_APPLICABLE:\s*'Not applicable'/.test(src)) throw new Error('NA mapping missing');
if (!/row\.visible/.test(src) || !/row\.enabled/.test(src)) throw new Error('backend-owned command presentation missing');
console.log('PASS V2-only consumption and physical Flow contracts');


for (const token of [
  "addConfigurationRows('metering', meteringConfiguration.properties)",
  "metering.selected_period",
  "meteringPeriodControl",
  "componentPeriodSelector(vm.periods, vm.periodId, 'metering-period')",
  "strategyAutomationMode",
  "energy.automation_mode",
  "alwaysEditable:true"
]) if(!fs.readFileSync('src/runtime/energy-v2-contract.js','utf8').includes(token) && !fs.readFileSync('src/app/energy-card.js','utf8').includes(token)) throw new Error('missing editable settings invariant '+token);

const card=fs.readFileSync('src/app/energy-card.js','utf8');
if(!card.includes("data-property-key':'energy.automation_mode'")) throw new Error('automation mode must bind canonical property write');
if(!card.includes("requestPropertyWrite('metering.selected_period'")) throw new Error('metering period must bind canonical property write');
console.log('PASS Metering period, Automation mode and policy settings expose canonical write paths');


const v2=fs.readFileSync('src/runtime/energy-v2-contract.js','utf8');
for (const token of [
  'const metering = object(attrs.metering)',
  'const retrospective = object(attrs.retrospective)',
  'metering:Object.keys(object(metering.periods)).length > 0',
  'retrospective:Object.keys(retrospective).length > 0'
]) if(!v2.includes(token)) throw new Error('missing canonical V2 evidence surface '+token);

for (const token of [
  'const periods=objectFrom(v2.metering?.periods || {})',
  'const rawPeriod=objectFrom(period)',
  'rawPeriod.baseline_reset_required',
  'vm.quality?.user_action_required === true && vm.command',
  'const retrospective=objectFrom(this.runtime().publicV2().retrospective || {})',
  'Waiting for measured evidence',
  'blocking_property_ids'
]) if(!card.includes(token)) throw new Error('missing structural Metering/Value/Retrospective invariant '+token);

if(card.includes("const rawPeriod={};")) throw new Error('Metering may not discard canonical backend period evidence');
if(card.includes("Canonical metering energy is not published by the current public contract.")) throw new Error('obsolete hard-coded unavailable Metering projection returned');
console.log('PASS canonical Metering, Value blocker and Retrospective evidence chain');
