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
  'canonical_period_energy_not_published',
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
if (!/Canonical per-asset period energy is not published by E0\.15\.48/.test(src)) throw new Error('metering must fail closed when canonical evidence is absent');
if (!/row\.visible/.test(src) || !/row\.enabled/.test(src)) throw new Error('backend-owned command presentation missing');
console.log('PASS V2-only consumption, physical Flow and fail-closed Metering contracts');
