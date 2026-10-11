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
  'RHI_ENERGY_CANONICAL_PROPERTY_V2'
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
const nativeCommands=fs.readFileSync('src/runtime/command-contract.js','utf8');
for(const guard of ['const visible=supported && a.visible===true',
  "a.execution_allowed===true", "String(a.availability || '').toUpperCase()==='AVAILABLE'",
  "enabled:allowed"])
  if(!nativeCommands.includes(guard))throw new Error('native command authority guard missing '+guard);
console.log('PASS V2-only consumption and physical Flow contracts');


for(const token of [
  "configuration={", "metering:{properties:meteringRows}",
  "strategy:{profiles:", "pricing:{properties:pricingRows}"
]) if(!fs.readFileSync('src/runtime/energy-v2-contract.js','utf8').includes(token))
  throw new Error('missing native configuration projection '+token);
for(const token of [
  "metering.selected_period","meteringPeriodControl",
  "componentPeriodSelector(vm.periods, vm.periodId, 'metering-period')",
  "strategyAutomationMode","energy.automation_mode","alwaysEditable:true"
]) if(!fs.readFileSync('src/app/energy-card.js','utf8').includes(token))
  throw new Error('missing editable UI affordance '+token);

const card=fs.readFileSync('src/app/energy-card.js','utf8');
if(!card.includes("data-property-key':'energy.automation_mode'")) throw new Error('automation mode must bind canonical property write');
if(!card.includes("requestPropertyWrite('metering.selected_period'")) throw new Error('metering period must bind canonical property write');
console.log('PASS Metering period, Automation mode and policy settings expose canonical write paths');


const native=fs.readFileSync('src/runtime/energy-v2-contract.js','utf8');
// Backend currently publishes per-period metrics, not a fully reconciled
// metering-period or retrospective canonical entity. The product must fail
// closed here, never synthesize period totals or retrospective scores.
for(const token of [
  'metering:{periods:{},available:false,reason:\'canonical_period_publication_unavailable\'}','retrospective:{}','valueAccounting',
  'readNativeEnergyMetric(hass,\'net_financial_result_eur\')'
]) if(!native.includes(token)) throw new Error('native Metering/Value missing-data invariant '+token);

for(const token of [
  'const periods=objectFrom(v2.metering?.periods || {})',
  'const rawPeriod=objectFrom(period)',
  'rawPeriod.baseline_reset_required',
  'vm.quality?.user_action_required === true && vm.command',
  'const retrospective=objectFrom(this.runtime().canonicalProduct().retrospective || {})',
  'Waiting for measured evidence',
  'blocking_property_ids'
]) if(!card.includes(token)) throw new Error('missing Metering/Value/Retrospective UX invariant '+token);
if(card.includes("const rawPeriod={};"))throw new Error('Metering must not discard native period evidence');
if(card.includes("Canonical metering energy is not published by the current public contract."))
  throw new Error('obsolete Public V2 metering source presented to users');
console.log('PASS native Metering/Value fail-closed, user settings and retrospective missing-evidence states');
