// Pure Energy product selectors. These functions know the normalized Energy V2
// shape; screens must not know Home Assistant entity ids or raw contract paths.
function selectEnergyAsset(store, assetId) {
  return createEnergyAssetProjection(store, assetId);
}

function selectEnergyOverview(store) {
  const row=store?.overview && typeof store.overview === 'object' ? store.overview : {};
  return Object.freeze({
    available:store?.available === true,
    status:String(row.status || row.product_status || row.state || store?.health || 'UNKNOWN'),
    primary:row.primary || row.primary_metric || null,
    summary:row.summary || {},
    flow:row.flow || {},
    conclusions:Array.isArray(row.conclusions) ? row.conclusions : [],
    reason:String(row.reason || row.product_reason || ''),
    raw:row,
    core:store?.core || {},
    source:'RHI_ENERGY_PUBLIC_CONTRACT_V2.core'
  });
}

function selectEnergyPlanning(store, horizon='D0') {
  const id=String(horizon || 'D0').toUpperCase();
  const planning=store?.planning && typeof store.planning === 'object' ? store.planning : {};
  const horizons=planning.horizons && typeof planning.horizons === 'object' ? planning.horizons : {};
  const row=horizons[id] && typeof horizons[id] === 'object' ? horizons[id] : {};
  return Object.freeze({
    available:store?.available === true && Object.keys(row).length > 0,
    horizon_id:id,
    horizon:row,
    summary:row,
    lane_totals:Object.freeze({
      required_kwh:row.required_kwh ?? null,
      planned_kwh:row.planned_kwh ?? null,
      executed_kwh:row.executed_kwh ?? null,
      still_to_plan_kwh:row.still_to_plan_kwh ?? null,
      flexible_required_kwh:row.flexible_required_kwh ?? null,
      flexible_planned_kwh:row.flexible_planned_kwh ?? null,
      flexible_executed_kwh:row.flexible_executed_kwh ?? null,
      flexible_still_to_plan_kwh:row.flexible_still_to_plan_kwh ?? null
    }),
    buckets:Array.isArray(row.buckets) ? row.buckets : [],
    flexible_plan:{},
    planning_objects:Array.isArray(store?.planningObjects) ? store.planningObjects : [],
    source:'RHI_ENERGY_PUBLIC_CONTRACT_V2.planning.horizons'
  });
}

function selectEnergyConfigurationProperties(store, scope) {
  const kind=String(scope || '').toLowerCase();
  const configuration=store?.configuration && typeof store.configuration === 'object' ? store.configuration : {};
  const section=configuration[kind] && typeof configuration[kind] === 'object' ? configuration[kind] : {};
  if (kind === 'strategy') {
    const configured=section.configured && typeof section.configured === 'object' ? section.configured : {};
    const effective=section.effective && typeof section.effective === 'object' ? section.effective : {};
    const rows=Array.isArray(configured.properties) ? configured.properties : [];
    const effectiveRows=Array.isArray(effective.properties) ? effective.properties : [];
    return Object.freeze({
      available:store?.available === true && configured.status !== 'UNAVAILABLE',
      scope:kind,
      properties:Object.freeze(rows.map(row=>Object.freeze({...row}))),
      effective_properties:Object.freeze(effectiveRows.map(row=>Object.freeze({...row}))),
      effective_state:String(effective.status || 'UNAVAILABLE'),
      effective_reason:String(effective.reason || ''),
      runtime_overrides:Object.freeze((Array.isArray(effective.runtime_overrides) ? effective.runtime_overrides : []).map(row=>Object.freeze({...row}))),
      source:'RHI_ENERGY_PUBLIC_CONTRACT_V2.configuration.strategy'
    });
  }
  const rows=Array.isArray(section.properties) ? section.properties : [];
  return Object.freeze({
    available:store?.available === true && Array.isArray(rows),
    scope:kind,
    properties:Object.freeze(rows.map(row=>Object.freeze({...row}))),
    effective_properties:Object.freeze([]),
    effective_state:String(section.availability || section.status || 'UNAVAILABLE'),
    effective_reason:String(section.reason || ''),
    source:`RHI_ENERGY_PUBLIC_CONTRACT_V2.configuration.${kind}`
  });
}

function selectEnergyStrategies(store) { return selectEnergyConfigurationProperties(store,'strategy'); }
function selectEnergyPricing(store) { return selectEnergyConfigurationProperties(store,'pricing'); }

function selectEnergyValue(store, period='today') {
  const accounting=store?.valueAccounting && typeof store.valueAccounting === 'object' ? store.valueAccounting : {};
  const id=String(period || accounting.selected_period_id || 'today').toLowerCase();
  const periods=accounting.periods && typeof accounting.periods === 'object' ? accounting.periods : {};
  const row=periods[id] && typeof periods[id] === 'object' ? periods[id] : {};
  const selectedId=String(accounting.selected_period_id || '').toLowerCase();
  const netOutcome=accounting.net_financial_result && typeof accounting.net_financial_result === 'object' ? accounting.net_financial_result : {};
  return Object.freeze({
    available:store?.available === true && Object.keys(row).length > 0,
    period_id:id,
    value:row,
    net_financial_result_eur:row.net_financial_result_eur ?? (id === selectedId ? netOutcome.value ?? accounting.net_financial_result_eur ?? null : null),
    net_financial_result:id === selectedId ? netOutcome : {},
    source:'RHI_ENERGY_PUBLIC_CONTRACT_V2.value_accounting'
  });
}

function selectEnergyMetering(store,period='today'){
  const metering=store?.metering&&typeof store.metering==='object'?store.metering:{};
  const id=String(period||metering.selected_period_id||'today').toLowerCase();
  const periods=metering.periods&&typeof metering.periods==='object'?metering.periods:{};
  const row=periods[id]&&typeof periods[id]==='object'?periods[id]:{};
  const summary=row.summary&&typeof row.summary==='object'?row.summary:{};
  const measured=summary.measured&&typeof summary.measured==='object'?summary.measured:{};
  const quality=summary.quality&&typeof summary.quality==='object'?summary.quality:{};
  const state=String(row.measurement_state||row.availability||row.status||quality.measurement_state||quality.health||'UNAVAILABLE').toUpperCase();
  return Object.freeze({available:store?.available===true&&Object.keys(row).length>0,partial:['PARTIAL','INCOMPLETE','ATTRIBUTION_PENDING'].includes(state),period_id:id,period:row,measured:Object.freeze({...measured}),quality:Object.freeze({...quality}),measurement_state:state,baseline_reset_required:row.baseline_reset_required===true,user_action_required:row.user_action_required===true||quality.user_action_required===true,reason:String(row.reason||quality.reason||''),source:'RHI_ENERGY_PUBLIC_CONTRACT_V2.metering.periods'});
}

function selectEnergyIntelligence(store) {
  const intelligence=store?.intelligence && typeof store.intelligence === 'object' ? store.intelligence : {};
  const decision=intelligence.decision && typeof intelligence.decision === 'object' ? intelligence.decision : {};
  const value=(key,fallback=null) => decision[key] !== undefined ? decision[key] : (intelligence[key] !== undefined ? intelligence[key] : fallback);
  return Object.freeze({
    available:store?.available === true && Object.keys(intelligence).length > 0,
    goal:value('goal',''),
    observation:value('observation',''),
    assessment:value('assessment',''),
    recommendation:value('recommendation', value('advice','')),
    advice:value('advice', value('recommendation','')),
    automation_mode:value('automation_mode',''),
    automation_status:value('automation_status',''),
    planning_state:value('planning_state',''),
    status:value('status', value('product_state','')),
    product_state:value('product_state', value('status','')),
    system_state:value('system_state',''),
    reason:value('reason',''),
    reason_label:value('reason_label',''),
    confidence:value('confidence',''),
    affected_assets:value('affected_assets',[]),
    next_review:value('next_review',''),
    outlook_reason:value('outlook_reason',''),
    recommended_target_asset_id:value('recommended_target_asset_id',''),
    recommended_action:value('recommended_action',''),
    recommended_action_id:value('recommended_action_id',null),
    raw:intelligence,
    decision,
    source:'RHI_ENERGY_PUBLIC_CONTRACT_V2.intelligence'
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
    core:present(store?.core) ? 'SUPPORTED' : 'UNAVAILABLE',
    assets:present(store?.objects) ? 'SUPPORTED' : 'UNAVAILABLE',
    relationships:Array.isArray(store?.relationships) ? 'SUPPORTED' : 'UNAVAILABLE',
    planning:present(store?.planning?.horizons) ? 'SUPPORTED' : 'UNAVAILABLE',
    pricing:present(store?.configuration?.pricing) ? 'SUPPORTED' : 'UNAVAILABLE',
    strategies:present(store?.configuration?.strategy) ? 'SUPPORTED' : 'UNAVAILABLE',
    commands:Array.isArray(store?.commands) ? 'SUPPORTED' : 'UNAVAILABLE',
    value_accounting:present(store?.valueAccounting) ? 'SUPPORTED' : 'UNAVAILABLE'
  });
  return Object.freeze({
    complete:Object.values(capabilities).every(value=>value === 'SUPPORTED'),
    capabilities,
    unsupported:Object.freeze(Object.entries(capabilities).filter(([,v])=>v!=='SUPPORTED').map(([k])=>k)),
    source:'RHI_ENERGY_PUBLIC_CONTRACT_V2.coverage'
  });
}
