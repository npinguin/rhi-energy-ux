// BEGIN GENERATED MODULE: runtime/consumption-contract.js
// R1.89.39 canonical live consumption contract. Public concepts are exactly:
// Site Consumption, Home Consumption, Flexible Loads and Home Battery.
// Retired pre-R1.89.39 consumption aliases are
// deliberately not read or reconstructed.
  function readLiveConsumptionContract(gateway) {
    const envelope = gateway.contract('consumption');
    const attrs = envelope.attributes || {};
    const rows = [];
    const append = value => {
      const row = objectFrom(value);
      const key = String(firstDefined(row.property_id, row.property_key, row.key, '') || '');
      if (key) rows.push({ ...row, key });
    };
    const byKey = parseMaybeJson(attrs.properties_by_key, attrs.properties_by_key || null);
    if (byKey && typeof byKey === 'object' && !Array.isArray(byKey)) Object.entries(byKey).forEach(([key,value]) => append({ key, ...objectFrom(value) }));
    const properties = parseMaybeJson(attrs.properties, attrs.properties || null);
    if (Array.isArray(properties)) properties.forEach(append);
    const rowFor = key => rows.find(row => String(firstDefined(row.property_id,row.property_key,row.key,'')) === key) || null;
    const canonicalValue = (key, nestedKey) => {
      const row = rowFor(key);
      const nested = objectFrom(parseMaybeJson(attrs[nestedKey], attrs[nestedKey] || null));
      return { row, nested, value:asNumber(firstDefined(row && rowValue(row, null), nested.power_kw)) };
    };
    const breakdownRaw = parseMaybeJson(attrs.demand_export_breakdown_json, attrs.demand_export_breakdown_json || null);
    const breakdownRows = Array.isArray(breakdownRaw) ? breakdownRaw.map(objectFrom) : [];
    const breakdownFor = rowId => breakdownRows.find(row => String(firstDefined(row.row_id,row.asset_id,row.id,'')) === rowId) || null;
    const withBreakdown = (part, rowId) => {
      const breakdown = breakdownFor(rowId);
      return { ...part, breakdown, value:part.value ?? asNumber(firstDefined(breakdown?.power_kw,breakdown?.value)) };
    };
    const site = withBreakdown(canonicalValue('site_consumption.power_kw', 'site_consumption'),'site_consumption');
    const home = withBreakdown(canonicalValue('home_consumption.power_kw', 'home_consumption'),'home_consumption');
    const flexible = withBreakdown(canonicalValue('flexible_loads.power_kw', 'flexible_loads'),'flexible_loads');
    let contributors = parseMaybeJson(firstDefined(flexible.row?.contributors_json, flexible.row?.contributors, flexible.nested.contributors_json, flexible.nested.contributors, attrs.flexible_load_contributors_json), []);
    if (!Array.isArray(contributors) && contributors && typeof contributors === 'object') contributors = Object.values(contributors);
    contributors = (Array.isArray(contributors) ? contributors : []).map(value => objectFrom(value));
    const statusFor = part => String(firstDefined(part.row?.status_label, part.row?.measurement_state, part.row?.availability, part.row?.health, part.breakdown?.status_label, part.breakdown?.measurement_state, part.breakdown?.availability, part.breakdown?.health, part.nested.status_label, part.nested.measurement_state, part.nested.availability, attrs.health, part.value !== null ? 'MEASURED' : 'UNAVAILABLE'));
    const reasonFor = part => String(firstDefined(part.row?.degraded_reason, part.row?.reason, part.row?.health_reason, part.breakdown?.degraded_reason, part.breakdown?.reason, part.breakdown?.health_reason, part.nested.degraded_reason, part.nested.reason, ''));
    return Object.freeze({
      envelope,
      siteConsumptionKw:site.value,
      homeConsumptionKw:home.value,
      flexibleLoadsKw:flexible.value,
      flexibleLoadContributors:Object.freeze(contributors),
      siteStatus:statusFor(site),
      homeStatus:statusFor(home),
      flexibleStatus:statusFor(flexible),
      siteReason:reasonFor(site),
      homeReason:reasonFor(home),
      flexibleReason:reasonFor(flexible),
      available:site.value !== null || home.value !== null || flexible.value !== null
    });
  }
// END GENERATED MODULE: runtime/consumption-contract.js
