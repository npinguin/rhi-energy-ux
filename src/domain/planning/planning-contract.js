// Authoritative Planning contract reader. No cross-domain fallback and no business recalculation.
  function planningObject(value) {
    const parsed = parseMaybeJson(value, value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  }
  function planningRows(value) {
    const parsed = parseMaybeJson(value, value);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') return Object.values(parsed);
    return [];
  }
  function planningById(value) {
    const parsed = parseMaybeJson(value, value);
    if (Array.isArray(parsed)) {
      return Object.fromEntries(parsed.map((row, index) => [
        String(row?.horizon_id || row?.id || (index === 0 ? 'D0' : 'D1')).toUpperCase(),
        planningObject(row)
      ]));
    }
    return planningObject(parsed);
  }
  function readPlanningContract(runtime, horizonId = 'D0') {
    const normalized=String(horizonId || '').toUpperCase();
    const today=runtime.nativePlanningTotals('D0');
    const tomorrow=runtime.nativePlanningTotals('D1');
    const supported=normalized==='D0' || normalized==='D1';
    const selected=supported ? (normalized==='D1' ? tomorrow : today) : {
      available:false, missing:['unsupported_planning_horizon'], values:{}
    };
    const nativeHorizon = supported && typeof runtime.nativePlanningHorizon === 'function'
      ? runtime.nativePlanningHorizon(normalized) : null;
    const published = nativeHorizon?.available === true ? nativeHorizon : null;
    const horizonDetails = published?.details || {};
    const planningAssets = published && Array.isArray(horizonDetails.planning_assets)
      ? horizonDetails.planning_assets : [];

    const totals=reader=>Object.fromEntries(Object.entries(reader.values).map(([key,row])=>
      [key,row.available ? Number(row.value) : null]));
    const horizon=Object.freeze({
      horizon_id:normalized,
      ...totals(selected),
      status:selected.available ? 'AVAILABLE' : 'INCOMPLETE',
      quality:Object.freeze({availability:selected.available ? 'AVAILABLE' : 'INCOMPLETE',
        missing:selected.missing})
    });
    const todayTotals=totals(today),tomorrowTotals=totals(tomorrow);
    return Object.freeze({
      entityId:null,
      contractVersion:'ENERGY_NATIVE_PLANNING',
      available:selected.available,
      attrs:Object.freeze({}),
      planId:published ? horizonDetails.plan_id ?? null : null,
      providerId:published ? horizonDetails.provider_id ?? null : null,
      providerPlanReference:published ? horizonDetails.provider_plan_ref ?? null : null,
      generatedAt:published ? horizonDetails.generated_at ?? null : null,
      sourceLanes:Object.freeze(planningObject(horizonDetails.source_lanes)),
      consumerLanes:Object.freeze(planningObject(horizonDetails.consumer_lanes)),
      balance:Object.freeze(planningObject(horizonDetails.balance)),
      batteryLedger:Object.freeze(planningObject(horizonDetails.battery_ledger)),
      policyEvidence:Object.freeze(planningObject(horizonDetails.policy_evidence)),
      planningAssets:Object.freeze(planningAssets),
      planningAssetsById:Object.freeze(Object.fromEntries(planningAssets
        .filter(row=>row && String(row.asset_id || '').trim())
        .map(row=>[String(row.asset_id),row]))),
      planningTodayTotals:Object.freeze(todayTotals),
      planningTomorrowTotals:Object.freeze(tomorrowTotals),
      planningCombinedTotals:Object.freeze({}),
      horizonsById:Object.freeze({D0:todayTotals,D1:tomorrowTotals}),
      horizonId:normalized,horizon,summary:horizon,
      laneTotals:Object.freeze(totals(selected)),
      buckets:Object.freeze(Array.isArray(horizonDetails.buckets) ? horizonDetails.buckets : []),
      currentPlanningBucket:Object.freeze({}),
      currentActionIntent:Object.freeze(published && horizonDetails.execution_policy && typeof horizonDetails.execution_policy === 'object' ? horizonDetails.execution_policy : {}),
      missingContractCapabilities:Object.freeze([
        ...(!published ? ['native_planning_buckets'] : []),
        ...(!published || !Array.isArray(horizonDetails.planning_assets) ? ['native_planning_assets'] : []),
        'native_planning_actions'
      ]),
      totalsSource:'rhi_energy.runtime/native_metric'
    });
  }

  function normalizePlanningLaneTotals(rawTotals = {}) {
    const totals = planningObject(rawTotals);
    const sources = planningObject(totals.sources);
    const consumers = planningObject(totals.consumers);
    const boundary = planningObject(totals.boundary);
    const flexibleRaw = firstDefined(
      consumers.flexible_assets,
      totals.flexible_assets,
      totals.flexible_loads_by_asset,
      totals.flexible_load_totals_by_asset,
      totals.consumer_totals_by_asset,
      totals.assets_by_id,
      {}
    );
    const parsedFlexible = parseMaybeJson(flexibleRaw, flexibleRaw);
    const flexibleAssetsById = Array.isArray(parsedFlexible)
      ? Object.fromEntries(parsedFlexible.map(row => [String(row?.asset_id || row?.id || ''), planningObject(row)]).filter(([id]) => id))
      : planningObject(parsedFlexible);
    const value = (...keys) => {
      for (const key of keys) {
        for (const scope of [totals, sources, consumers, boundary]) {
          const number = asNumber(scope[key]);
          if (number !== null) return number;
        }
      }
      return null;
    };
    return Object.freeze({
      raw: totals,
      sources,
      consumers,
      boundary,
      flexibleAssetsById,
      solarKwh: value('solar_kwh','solar_production_kwh','solar_total_kwh'),
      homeBatteryOutKwh: value('home_battery_supply_kwh','home_battery_discharge_kwh','battery_discharge_kwh','battery_out_kwh'),
      gridInKwh: value('grid_in_kwh','grid_import_kwh'),
      homeKwh: value('home_kwh','home_consumption_kwh','fixed_demand_kwh'),
      flexibleLoadsKwh: value('managed_energy_kwh','flexible_loads_kwh','planned_flexible_kwh','flexible_planned_kwh'),
      homeBatteryInKwh: value('home_battery_charge_kwh','battery_charge_kwh','battery_in_kwh'),
      gridOutKwh: value('grid_out_kwh','grid_export_kwh'),
      sourceTotalKwh: value('source_total_kwh','sources_total_kwh'),
      useTotalKwh: value('use_total_kwh','demand_total_kwh','consumer_total_kwh'),
      balanceDeltaKwh: value('balance_delta_kwh','lane_balance_delta_kwh'),
      homeBatteryNeedKwh: value('home_battery_need_kwh','battery_reserve_need_kwh')
    });
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { readPlanningContract, normalizePlanningLaneTotals };
