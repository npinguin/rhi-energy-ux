// ---- src/domain/planning/contract-adapter.js ----
// Canonical support is capability-based. R1.79.3 compatibility is deliberately bounded to the
// published bucket fields and must not become a second planning owner.
  function planningArray(value) {
    const parsed = parseMaybeJson(value, value);
    return Array.isArray(parsed) ? parsed : [];
  }

  function planningParticipantId(row = {}) {
    return String(firstDefined(row.participant_id, row.asset_id, row.target_asset_id, row.flexible_asset_id, ''));
  }

  function planningEnergyFromPower(row = {}, durationMinutes = 60) {
    const direct = asNumber(firstDefined(row.planned_demand_kwh, row.planned_supply_kwh, row.planned_energy_kwh, row.energy_kwh));
    if (direct !== null) return direct;
    const power = asNumber(firstDefined(row.planned_power_kw, row.power_kw, row.allocated_power_kw));
    return power === null ? null : power * Math.max(0, asNumber(durationMinutes) || 60) / 60;
  }

  function signedPlanningGrid(bucket = {}) {
    const signed = asNumber(firstDefined(bucket.grid_net_kwh, bucket.expected_grid_net_kwh, bucket.net_grid_kwh, bucket.grid_kwh));
    if (signed !== null) return { importKwh: Math.max(0, signed), exportKwh: Math.max(0, -signed) };
    return {
      importKwh: asNumber(firstDefined(bucket.expected_grid_import_kwh, bucket.grid_import_kwh)),
      exportKwh: asNumber(firstDefined(bucket.expected_grid_export_kwh, bucket.grid_export_kwh))
    };
  }

  function adaptPlanningBucket(bucket = {}, contractVersion = '') {
    const version = String(contractVersion || '');
    const isR1794 = ['advisory_source_lane','advisory_consumer_lane','advisory_boundary_flows','advisory_lane_balance_delta_kwh']
      .some(key => Object.prototype.hasOwnProperty.call(bucket, key));
    const isR1793 = version.includes('R1.79.3');
    if (!isR1794 && !isR1793) return { raw:bucket, id:String(firstDefined(bucket.bucket_id,bucket.id,'')), startTime:firstDefined(bucket.start_time,bucket.start,bucket.bucket_start,''), endTime:firstDefined(bucket.end_time,bucket.end,bucket.bucket_end,''), durationMinutes:asNumber(bucket.duration_minutes)||60, sources:[], consumers:[], boundary:{gridExportKwh:null}, balanceDeltaKwh:null, state:'unavailable', reason:'unsupported_planning_contract', confidence:'', forecastQuality:'', disclosure:'', canonicalLanes:false, contractSupported:false, contractFamily:'unsupported' };
    const durationMinutes = asNumber(bucket.duration_minutes) || 60;
    const canonicalSources = planningArray(bucket.advisory_source_lane);
    const canonicalConsumers = planningArray(bucket.advisory_consumer_lane);
    const hasCanonicalLanes = isR1794;
    let sources = canonicalSources;
    let consumers = canonicalConsumers;
    let boundary = objectFrom(parseMaybeJson(bucket.advisory_boundary_flows, bucket.advisory_boundary_flows || {}));

    if (!hasCanonicalLanes) {
      const grid = signedPlanningGrid(bucket);
      const allocations = planningArray(firstDefined(bucket.asset_allocations, bucket.asset_allocations_json, []));
      sources = [
        { participant_id:'solar', display_name:'Solar', participant_type:'producer', lane_role:'source', flow_direction:'production', planned_supply_kwh:asNumber(bucket.solar_forecast_kwh), planning_state:'forecast', forecast_quality:bucket.forecast_quality },
        { participant_id:'grid', display_name:'Grid', participant_type:'grid_connection', lane_role:'source', flow_direction:(grid.importKwh || 0) > 0 ? 'import' : 'idle', planned_supply_kwh:grid.importKwh, planning_state:(grid.importKwh || 0) > 0 ? 'residual_supply' : 'not_required' }
      ];
      consumers = [
        { participant_id:'home', display_name:'Home', participant_type:'fixed_consumer', lane_role:'consumer', flow_direction:'consume', planned_demand_kwh:asNumber(bucket.base_demand_forecast_kwh), planning_state:'forecast' },
        ...allocations.map(row => ({ ...row, participant_id:planningParticipantId(row), lane_role:'consumer', flow_direction:'charge', planned_demand_kwh:planningEnergyFromPower(row, durationMinutes), allocation_state:firstDefined(row.allocation_state, 'advisory') }))
      ];
      boundary = { grid_export_kwh:grid.exportKwh };
    }

    const normalize = (row, laneRole) => ({
      ...row,
      participantId: planningParticipantId(row),
      laneRole,
      energyKwh: planningEnergyFromPower(row, durationMinutes),
      powerKw: asNumber(firstDefined(row.planned_power_kw, row.power_kw, row.allocated_power_kw)),
      state: String(firstDefined(row.planning_state, row.state, row.status, '') || '').toLowerCase(),
      allocationState: String(firstDefined(row.allocation_state, '') || '').toLowerCase(),
      executionAllowed: firstDefined(row.plan_execution_allowed, null),
      reason: firstDefined(row.reason_label, row.user_reason_label, row.reason_code, row.reason, '')
    });
    const normalizedSources = sources.map(row => normalize(row, 'source'));
    const normalizedConsumers = consumers.map(row => normalize(row, 'consumer'));
    return {
      raw: bucket,
      id: String(firstDefined(bucket.bucket_id, bucket.id, '')),
      startTime: firstDefined(bucket.start_time, bucket.start, bucket.bucket_start, ''),
      endTime: firstDefined(bucket.end_time, bucket.end, bucket.bucket_end, ''),
      durationMinutes,
      sources: normalizedSources,
      consumers: normalizedConsumers,
      boundary: { gridExportKwh: asNumber(firstDefined(boundary.grid_export_kwh, boundary.export_kwh)) },
      balanceDeltaKwh: asNumber(bucket.advisory_lane_balance_delta_kwh),
      state: String(firstDefined(bucket.planning_state, bucket.state, '') || '').toLowerCase(),
      reason: firstDefined(bucket.reason_label, bucket.reason_code, bucket.reason, ''),
      confidence: firstDefined(bucket.confidence, ''),
      forecastQuality: firstDefined(bucket.forecast_quality, ''),
      disclosure: firstDefined(bucket.estimation_disclosure, ''),
      canonicalLanes: hasCanonicalLanes
      ,contractSupported: true
      ,contractFamily: isR1794 ? 'R1.79.4' : 'R1.79.3'
    };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { adaptPlanningBucket, signedPlanningGrid, planningEnergyFromPower };

// ---- src/domain/planning/planning-contract.js ----
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

// ---- src/domain/planning/planning-view-model.js ----
// Stable UX model builder for Planning. Renderers receive meaning, never backend paths.
  function createPlanningViewModel({ gateway, horizonId, flexibleAssets = [], storage = null }) {
    const contract = readPlanningContract(gateway, horizonId);
    const laneTotals = normalizePlanningLaneTotals(contract.laneTotals);
    const rows = contract.buckets.map(bucket => adaptPlanningBucket(bucket, contract.contractVersion));
    const quality = planningObject(contract.horizon.quality);
    const contractSupported = rows.length
      ? rows.every(row => row.contractSupported)
      : /R1\.(79\.[34]|89\.)/.test(contract.contractVersion);
    const stateText = String(firstDefined(contract.horizon.state, contract.horizon.status, quality.health, contract.horizon.quality, '')).toLowerCase();
    return Object.freeze({
      horizonId: contract.horizonId,
      horizon: contract.horizon,
      buckets: contract.buckets,
      assets: flexibleAssets,
      planningAssets: contract.planningAssets,
      planningAssetsById: contract.planningAssetsById,
      todayTotals: contract.planningTodayTotals,
      tomorrowTotals: contract.planningTomorrowTotals,
      combinedTotals: contract.planningCombinedTotals,
      storage,
      rows,
      summary: contract.summary,
      laneTotals,
      quality,
      currentActionIntent: contract.currentActionIntent,
      contractVersion: contract.contractVersion,
      contractSupported,
      currentBucketId: String(contract.currentPlanningBucket.bucket_id || ''),
      totalsSource: contract.totalsSource,
      complete: contractSupported && !/incomplete|partial|unavailable/.test(stateText)
    });
  }