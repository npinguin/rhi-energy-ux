// Current Energy consumption is read only from backend-owned canonical property
// entities. No Public V2, source-provider, aggregate or derived-power fallback.
function readLiveConsumptionContract(gateway) {
  const site=readTypedPropertyContract(gateway,'consumption','site_consumption.power_kw');
  // Home consumption is published as a dedicated native HA metric by Energy.
  // Do not treat a second property-path guess as fallback or recompute it from
  // solar/grid/battery flows. The producer's availability is authoritative.
  const homeMetric=readNativeEnergyMetric(gateway?.host?.hass || {},'home_consumption_power_kw');
  const home=Object.freeze({
    number:homeMetric.available ? Number(homeMetric.value) : null,
    health:homeMetric.available ? 'AVAILABLE' : 'UNAVAILABLE',
    reason:homeMetric.reason || ''
  });
  // Flexible power is independently published by the backend, if present.
  const flexible=readTypedPropertyContract(gateway,'consumption','flexible_loads.power_kw');
  const attributed=readTypedPropertyContract(gateway,'consumption','flexible_loads.attributed_power_kw');
  return Object.freeze({
    envelope:Object.freeze({source:'RHI_ENERGY_CANONICAL_PROPERTY_V2'}),
    siteConsumptionKw:site.number,
    homeConsumptionKw:home.number,
    flexibleLoadsKw:flexible.number,
    attributedFlexibleLoadsKw:attributed.number,
    // Asset participation must come from a separate native participant contract.
    // Empty means no participant evidence published, not zero participation.
    flexibleLoadContributors:Object.freeze([]),
    siteStatus:site.health,
    homeStatus:home.health,
    flexibleStatus:flexible.health,
    siteReason:site.reason,
    homeReason:home.reason,
    flexibleReason:flexible.reason,
    available:[site,home,flexible].some(row=>row.health==='AVAILABLE'),
    source:'RHI_ENERGY_CANONICAL_PROPERTY_V2'
  });
}
