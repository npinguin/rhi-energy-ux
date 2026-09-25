// Pure Energy product selectors. These functions know the normalized Energy V2
// shape; screens must not know Home Assistant entity ids or raw contract paths.
function selectEnergyAsset(store, assetId) {
  return createEnergyAssetProjection(store, assetId);
}

function selectEnergyOverview(store) {
  const row=store?.overview && typeof store.overview === 'object' ? store.overview : {};
  return Object.freeze({
    available:store?.available === true && Object.keys(row).length > 0,
    status:String(row.status || row.product_status || row.state || 'UNAVAILABLE'),
    primary:row.primary || row.primary_metric || null,
    summary:row.summary || {},
    flow:row.flow || {},
    conclusions:Array.isArray(row.conclusions) ? row.conclusions : [],
    reason:String(row.reason || row.product_reason || ''),
    raw:row,
    source:'RHI_ENERGY_PUBLIC_CONTRACT_V2.overview'
  });
}

function selectEnergyPlanning(store, horizon='D0') {
  const id=String(horizon || 'D0').toUpperCase();
  const planning=store?.planning && typeof store.planning === 'object' ? store.planning : {};
  const horizons=planning.planning_horizons && typeof planning.planning_horizons === 'object'
    ? planning.planning_horizons : {};
  const row=horizons[id] && typeof horizons[id] === 'object' ? horizons[id] : {};
  const summary=row.summary && typeof row.summary === 'object' ? row.summary : {};
  return Object.freeze({
    available:store?.available === true && Object.keys(row).length > 0,
    horizon_id:id,
    horizon:row,
    summary,
    lane_totals:summary.lane_totals || row.lane_totals || {},
    buckets:Array.isArray(row.buckets) ? row.buckets : [],
    flexible_plan:planning.flexible_plan || {},
    planning_objects:Array.isArray(store?.planningObjects) ? store.planningObjects : [],
    source:'RHI_ENERGY_PUBLIC_CONTRACT_V2.planning'
  });
}

function selectEnergyConfigurationProperties(store, scope) {
  const kind=String(scope || '').toLowerCase();
  const configuration=store?.configuration && typeof store.configuration === 'object' ? store.configuration : {};
  const section=configuration[kind] && typeof configuration[kind] === 'object' ? configuration[kind] : {};
  const rows=section.properties || section.configured_properties || [];
  return Object.freeze({
    available:store?.available === true && Array.isArray(rows),
    scope:kind,
    properties:Object.freeze((Array.isArray(rows) ? rows : []).map(row=>Object.freeze({...row}))),
    effective_properties:Object.freeze((Array.isArray(section.effective_properties) ? section.effective_properties : []).map(row=>Object.freeze({...row}))),
    effective_state:String(section.effective_state || section.availability || 'UNAVAILABLE'),
    effective_reason:String(section.effective_reason || ''),
    source:`RHI_ENERGY_PUBLIC_CONTRACT_V2.configuration.${kind}`
  });
}

function selectEnergyStrategies(store) {
  return selectEnergyConfigurationProperties(store,'strategy');
}

function selectEnergyPricing(store) {
  return selectEnergyConfigurationProperties(store,'pricing');
}

function selectEnergyValue(store, period='today') {
  const accounting=store?.valueAccounting && typeof store.valueAccounting === 'object' ? store.valueAccounting : {};
  const id=String(period || accounting.selected_period_id || 'today').toLowerCase();
  const periods=accounting.periods && typeof accounting.periods === 'object' ? accounting.periods : {};
  const row=periods[id] && typeof periods[id] === 'object' ? periods[id] : {};
  return Object.freeze({
    available:store?.available === true && Object.keys(row).length > 0,
    period_id:id,
    value:row,
    net_financial_result_eur:row.net_financial_result_eur ?? (id === String(accounting.selected_period_id || '').toLowerCase() ? accounting.net_financial_result_eur : null),
    source:'RHI_ENERGY_PUBLIC_CONTRACT_V2.value_accounting'
  });
}

function selectEnergyMetering(store, period='today') {
  // E0.15.47 publishes financial period actuals, not canonical period-energy
  // metering detail. Fail closed instead of reconstructing Energy truth in UX.
  const id=String(period || 'today').toLowerCase();
  return Object.freeze({
    available:false,
    partial:false,
    period_id:id,
    metrics:Object.freeze({}),
    reason:'canonical_period_energy_not_published',
    source:'RHI_ENERGY_PUBLIC_CONTRACT_V2'
  });
}

function selectEnergyActivity(store) {
  return Object.freeze({
    available:store?.available === true,
    rows:Object.freeze((Array.isArray(store?.activity) ? store.activity : []).map(row=>Object.freeze({...row}))),
    source:'RHI_ENERGY_PUBLIC_CONTRACT_V2.activity'
  });
}

function selectEnergyCommands(store, assetId='') {
  const wanted=String(assetId || '');
  const rows=(Array.isArray(store?.commands) ? store.commands : [])
    .filter(row=>!wanted || String(row.target_asset_id || '') === wanted)
    .map(row=>Object.freeze({...row}));
  return Object.freeze({
    available:store?.available === true,
    rows:Object.freeze(rows),
    source:'RHI_ENERGY_PUBLIC_CONTRACT_V2.commands'
  });
}

function selectEnergyCoverage(store) {
  const present=value => {
    if(Array.isArray(value)) return value.length > 0;
    return !!value && typeof value === 'object' && Object.keys(value).length > 0;
  };
  const capabilities=Object.freeze({
    assets:present(store?.objects) ? 'SUPPORTED' : 'UNAVAILABLE',
    relationships:present(store?.relationships) ? 'SUPPORTED' : 'UNAVAILABLE',
    overview:present(store?.overview) ? 'SUPPORTED' : 'UNAVAILABLE',
    planning:present(store?.planning) ? 'SUPPORTED' : 'UNAVAILABLE',
    pricing:present(store?.configuration?.pricing) ? 'SUPPORTED' : 'UNAVAILABLE',
    strategies:present(store?.configuration?.strategy) ? 'SUPPORTED' : 'UNAVAILABLE',
    commands:Array.isArray(store?.commands) ? 'SUPPORTED' : 'UNAVAILABLE',
    activity:Array.isArray(store?.activity) ? 'SUPPORTED' : 'UNAVAILABLE',
    value_accounting:present(store?.valueAccounting) ? 'SUPPORTED' : 'UNAVAILABLE',
    metering:'UNAVAILABLE'
  });
  return Object.freeze({
    complete:Object.values(capabilities).every(value=>value === 'SUPPORTED'),
    capabilities,
    unsupported:Object.freeze(Object.entries(capabilities).filter(([,v])=>v!=='SUPPORTED').map(([k])=>k)),
    source:'RHI_ENERGY_PUBLIC_CONTRACT_V2'
  });
}
