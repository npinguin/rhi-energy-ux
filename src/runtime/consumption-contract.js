// Canonical live consumption reader from RHI_ENERGY_PUBLIC_CONTRACT_V2.
// Energy owns all balance semantics; the UX only selects already-resolved values.
function readLiveConsumptionContract(gateway) {
  const v2 = readEnergyPublicV2(gateway);
  const read = key => v2.field(key);
  const site = read('site_consumption.power_kw');
  const home = read('home_consumption.power_kw');
  const flexible = read('flexible_loads.power_kw');
  const contributors = (v2.flexibleAssets || []).map(row => Object.freeze({
    ...row,
    asset_id:String(row.asset_id || ''),
    power_kw:asNumber(row.power_kw)
  }));
  const statusFor = field => String(field.state || (field.resolved ? 'resolved' : 'unavailable')).toUpperCase();
  return Object.freeze({
    envelope:v2.envelope,
    siteConsumptionKw:asNumber(site.value),
    homeConsumptionKw:asNumber(home.value),
    flexibleLoadsKw:asNumber(flexible.value),
    flexibleLoadContributors:Object.freeze(contributors),
    siteStatus:statusFor(site),
    homeStatus:statusFor(home),
    flexibleStatus:statusFor(flexible),
    siteReason:String(site.reason || ''),
    homeReason:String(home.reason || ''),
    flexibleReason:String(flexible.reason || ''),
    available:site.resolved || home.resolved || flexible.resolved,
    source:'RHI_ENERGY_PUBLIC_CONTRACT_V2'
  });
}
