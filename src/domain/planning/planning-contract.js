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
  function readPlanningContract(gateway, horizonId = 'D0') {
    const normalized = String(horizonId || 'D0').toUpperCase();
    const v2 = readEnergyPublicV2(gateway);
    const planning = planningObject(v2.planning);
    const horizonsById = planningById(planning.horizons);
    const horizon = planningObject(horizonsById[normalized] || horizonsById[normalized.toLowerCase()]);
    const summary = horizon;
    const laneTotals = planningObject({
      required_kwh:horizon.required_kwh,
      planned_kwh:horizon.planned_kwh,
      executed_kwh:horizon.executed_kwh,
      still_to_plan_kwh:horizon.still_to_plan_kwh,
      flexible_required_kwh:horizon.flexible_required_kwh,
      flexible_planned_kwh:horizon.flexible_planned_kwh,
      flexible_executed_kwh:horizon.flexible_executed_kwh,
      flexible_still_to_plan_kwh:horizon.flexible_still_to_plan_kwh
    });
    const buckets = planningRows(firstDefined(horizon.buckets, horizon.timeline, horizon.rows))
      .map((row,index)=>({ bucket_id:row?.bucket_id || row?.id || `bucket_${index+1}`, ...planningObject(row) }));
    const planningObjects = planningRows(v2.layers?.planning_objects);
    const planningAssets = planningObjects.filter(row => String(row.asset_id || row.target_asset_id || ''));
    const planningAssetsById = Object.fromEntries(planningAssets.map(row => [String(row.asset_id || row.target_asset_id), planningObject(row)]));
    const d0 = planningObject(horizonsById.D0);
    const d1 = planningObject(horizonsById.D1);
    const d0Totals = planningObject(d0);
    const d1Totals = planningObject(d1);
    return Object.freeze({
      entityId:v2.envelope.entityId,
      contractVersion:v2.contractVersion,
      available:v2.available,
      attrs:planning,
      planningAssets,
      planningAssetsById,
      planningTodayTotals:d0Totals,
      planningTomorrowTotals:d1Totals,
      planningCombinedTotals:{},
      horizonsById,
      horizonId:normalized,
      horizon,
      summary,
      laneTotals,
      buckets,
      currentPlanningBucket:{},
      currentActionIntent:{},
      totalsSource:'RHI_ENERGY_PUBLIC_CONTRACT_V2.planning.horizons'
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
