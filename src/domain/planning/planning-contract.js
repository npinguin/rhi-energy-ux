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
    const contract = gateway.contract('planning');
    const attrs = contract.attributes;
    const planningAssets = planningRows(firstDefined(attrs.planning_assets_json, attrs.planning_assets));
    const planningAssetsById = planningById(firstDefined(attrs.planning_assets_by_id, attrs.planning_assets_json));
    const planningTodayTotals = planningObject(firstDefined(attrs.planning_today_totals_json, attrs.planning_today_totals));
    const planningTomorrowTotals = planningObject(firstDefined(attrs.planning_tomorrow_totals_json, attrs.planning_tomorrow_totals));
    const planningCombinedTotals = planningObject(firstDefined(attrs.planning_combined_totals_json, attrs.planning_combined_totals));
    const horizonsById = planningById(firstDefined(
      attrs.planning_horizons_by_id,
      attrs.planning_horizons_json,
      attrs.planning_horizons
    ));
    const horizon = planningObject(horizonsById[normalized] || horizonsById[normalized.toLowerCase()]);
    const summary = planningObject(firstDefined(horizon.summary, horizon.planning_summary));
    const embeddedTotals = planningObject(firstDefined(
      horizon.lane_totals,
      horizon.lane_totals_json,
      summary.lane_totals,
      summary.lane_totals_json,
      horizon.planning_totals,
      horizon.planning_totals_json
    ));
    const typedById = planningById(firstDefined(attrs.planning_lane_totals_json, attrs.planning_lane_totals_by_id));
    const typedTotals = planningObject(typedById[normalized] || typedById[normalized.toLowerCase()]);
    const totalsById = planningById(firstDefined(
      attrs.planning_horizon_totals_by_id,
      attrs.planning_horizon_totals_json,
      attrs.planning_horizon_totals
    ));
    const indexedTotals = planningObject(totalsById[normalized] || totalsById[normalized.toLowerCase()]);
    const laneTotals = Object.keys(embeddedTotals).length
      ? embeddedTotals
      : (Object.keys(typedTotals).length ? typedTotals : indexedTotals);
    const buckets = planningRows(firstDefined(
      horizon.buckets_json,
      horizon.buckets,
      horizon.timeline_json,
      horizon.timeline,
      horizon.rows_json,
      horizon.rows
    )).map((row, index) => ({ bucket_id: row?.bucket_id || row?.id || `bucket_${index + 1}`, ...planningObject(row) }));
    return Object.freeze({
      entityId: contract.entityId,
      contractVersion: contract.contractVersion,
      available: contract.available,
      attrs,
      planningAssets,
      planningAssetsById,
      planningTodayTotals,
      planningTomorrowTotals,
      planningCombinedTotals,
      horizonsById,
      horizonId: normalized,
      horizon,
      summary,
      laneTotals,
      buckets,
      currentPlanningBucket: planningObject(attrs.current_planning_bucket),
      currentActionIntent: planningObject(attrs.current_action_intent_json),
      totalsSource: Object.keys(embeddedTotals).length ? 'horizon.summary.lane_totals'
        : (Object.keys(typedTotals).length ? 'planning_lane_totals_json' : 'planning_horizon_totals_json')
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
