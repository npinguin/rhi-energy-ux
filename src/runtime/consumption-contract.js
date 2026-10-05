// Canonical live consumption reader from RHI_ENERGY_PUBLIC_CONTRACT_V2.
// Energy owns all balance semantics; the UX only selects already-resolved core values.
function readLiveConsumptionContract(gateway) {
  const v2 = readEnergyPublicV2(gateway);
  const site = v2.canonicalField('site_consumption.power_kw');
  const home = v2.canonicalField('home_consumption.power_kw');
  const flexible = v2.field('flexible_loads.power_kw');
  const attributed = v2.field('flexible_loads.attributed_power_kw');
  const contributors = (v2.flexibleAssets || [])
    .filter(row => {
      const sourceContext = row?.source_context && typeof row.source_context === 'object' ? row.source_context : {};
      const mobilityContext = sourceContext.mobility && typeof sourceContext.mobility === 'object' ? sourceContext.mobility : {};
      const kind = String(firstDefined(row?.participation_state,row?.source_asset_kind,row?.asset_type,row?.object_class,mobilityContext.consumer_fallback,'') || '').toLowerCase();
      return row?.infrastructure_only !== true
        && !['infrastructure_only','charger','connection','unassigned_charger'].includes(kind);
    })
    .map(row => Object.freeze({
      ...row,
      asset_id:String(row.asset_id || ''),
      power_kw:asNumber(firstDefined(row.power_kw,row.current_power_kw,row.actual_power_kw))
    }));
  const statusFor = field => String(field.status || field.state || (field.resolved ? 'AVAILABLE' : 'UNAVAILABLE')).toUpperCase();
  return Object.freeze({
    envelope:v2.envelope,
    siteConsumptionKw:asNumber(site.value),
    homeConsumptionKw:asNumber(home.value),
    flexibleLoadsKw:asNumber(flexible.value),
    attributedFlexibleLoadsKw:asNumber(attributed.value),
    flexibleLoadContributors:Object.freeze(contributors),
    siteStatus:statusFor(site),
    homeStatus:statusFor(home),
    flexibleStatus:statusFor(flexible),
    siteReason:String(site.reason || ''),
    homeReason:String(home.reason || ''),
    flexibleReason:String(flexible.reason || ''),
    available:site.status === 'AVAILABLE' || home.status === 'AVAILABLE' || flexible.status === 'AVAILABLE',
    source:'RHI_ENERGY_PUBLIC_CONTRACT_V2.core'
  });
}
