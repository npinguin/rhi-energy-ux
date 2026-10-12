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
  function readPlanningContract(runtime, horizonId = 'D0', variant = 'effective') {
    const normalized=String(horizonId || '').toUpperCase();
    const preview = variant === 'baseline';
    const validVariant = ['effective','baseline'].includes(variant);
    const requiredFields=['required_kwh','planned_kwh','still_to_plan_kwh',
      'flexible_required_kwh','flexible_planned_kwh','flexible_still_to_plan_kwh'];
    const baselineTotals = id => {
      const detail = runtime.nativePlanningHorizon?.(id,'baseline');
      const facts = detail?.available === true ? planningObject(detail.details) : {};
      const values=Object.fromEntries(requiredFields.map(key => {
        const value=facts[key];
        const valid=typeof value === 'number' && Number.isFinite(value);
        return [key,{available:valid,value:valid?value:null}];
      }));
      const missing=requiredFields.filter(key=>values[key].available!==true);
      return {available:detail?.available === true && !missing.length,
        values,missing};
    };
    const today=preview ? baselineTotals('D0') : runtime.nativePlanningTotals('D0');
    const tomorrow=preview ? baselineTotals('D1') : runtime.nativePlanningTotals('D1');
    const supported=validVariant && (normalized==='D0' || normalized==='D1');
    const selected=supported ? (normalized==='D1' ? tomorrow : today) : {
      available:false, missing:['unsupported_planning_horizon'], values:{}
    };
    const nativeHorizon = supported && typeof runtime.nativePlanningHorizon === 'function'
      ? runtime.nativePlanningHorizon(normalized,variant) : null;
    const published = nativeHorizon?.available === true ? nativeHorizon : null;
    const horizonDetails = published?.details || {};
    const publicationMetadata = nativeHorizon?.metadata || {};
    // Native numeric totals remain available as measurement evidence but never
    // authorize an effective schedule without one quality-complete horizon.
    const effectiveAvailable = selected.available===true && !!published;
    const publicationStatus = effectiveAvailable ? 'AVAILABLE' :
      nativeHorizon?.published===true ? 'INCOMPLETE' :
        nativeHorizon?.status || 'UNAVAILABLE';
    const requestedProvider=String(publicationMetadata.requested_provider||'');
    const effectiveProvider=preview ? '' : String(publicationMetadata.provider_id||'');
    const providerHold=!!requestedProvider&&!effectiveProvider;
    const planningAssets = published && Array.isArray(horizonDetails.planning_assets)
      ? horizonDetails.planning_assets : [];

    const totals=reader=>Object.fromEntries(Object.entries(reader.values).map(([key,row])=>
      [key,row.available ? Number(row.value) : null]));
    const horizon=Object.freeze({
      horizon_id:normalized,
      ...totals(selected),
      status:publicationStatus,
      summary:Object.freeze(planningObject(horizonDetails.summary)),
      quality:Object.freeze({availability:publicationStatus,
        missing:selected.missing,
        effective_horizon:effectiveAvailable,
        metrics_available:selected.available===true})
    });
    const todayTotals=totals(today),tomorrowTotals=totals(tomorrow);
    return Object.freeze({
      entityId:null,
      contractVersion:'ENERGY_NATIVE_PLANNING',
      variant,previewOnly:preview,
      available:effectiveAvailable,
      totalsAvailable:selected.available===true,
      provisionalTotals:selected.available===true&&!effectiveAvailable,
      published:nativeHorizon?.published===true||!!published,
      publicationStatus,
      requestedProvider,effectiveProvider,providerHold,
      reasonCode:effectiveAvailable?'':String(nativeHorizon?.reason||publicationMetadata.reason_code||'effective_horizon_not_published'),
      executionAuthorized:!preview&&effectiveAvailable&&publicationMetadata.execution_authorized===true,
      attrs:Object.freeze({}),
      planId:published ? publicationMetadata.plan_id ?? horizonDetails.plan_id ?? null : null,
      providerId:published ? publicationMetadata.provider_id ?? horizonDetails.provider_id ?? null : null,
      providerPlanReference:published ? horizonDetails.provider_plan_ref ?? null : null,
      generatedAt:published ? publicationMetadata.generated_at ?? horizonDetails.generated_at ?? null : null,
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
      laneTotals:Object.freeze(preview ? planningObject(horizonDetails.summary?.lane_totals) : totals(selected)),
      buckets:Object.freeze(Array.isArray(horizonDetails.buckets) ? horizonDetails.buckets : []),
      // The producer may explicitly identify the current bucket; otherwise it is unknown.
      currentPlanningBucket:Object.freeze(planningObject(horizonDetails.current_bucket)),
      currentActionIntent:Object.freeze(!preview && published && horizonDetails.execution_policy && typeof horizonDetails.execution_policy === 'object' ? horizonDetails.execution_policy : {}),
      missingContractCapabilities:Object.freeze([
        ...(!published ? ['native_effective_horizon','native_planning_buckets'] : []),
        ...(!published || !Array.isArray(horizonDetails.planning_assets) ? ['native_planning_assets'] : []),
        ...(!preview && (!published || !horizonDetails.execution_policy || typeof horizonDetails.execution_policy !== 'object' || Array.isArray(horizonDetails.execution_policy))
          ? ['native_planning_actions'] : [])
      ]),
      totalsSource:preview?'rhi_energy.runtime/native_baseline_horizon':'rhi_energy.runtime/native_metric'
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
