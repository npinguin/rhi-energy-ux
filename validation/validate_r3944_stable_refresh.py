from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = (root / 'source' / 'homebrain-energy-card.js').read_text(encoding='utf-8')
checks = {
    'release_identity': "const UX_VERSION = 'R3.94.12'" in source,
    'metering_records_owner': "const recordRows = this.meteringRowsFromRecords(rt, periodId);" in source,
    'metering_summary_quality_only': "summary:{ quality:selectedSummary }" in source,
    'metering_no_summary_measured_projection': "firstDefined(selectedSummary.measured,selectedSummary.values" not in source,
    'metering_zero_preserved': "value:asNumber(firstDefined(record?.energy_kwh,record?.value))" in source,
    'active_view_restored': "window.sessionStorage.getItem('homebrain.energy.active_view')" in source,
    'active_view_persisted': "window.sessionStorage.setItem('homebrain.energy.active_view', this.view)" in source,
    'render_coalesced': 'scheduleRender(immediate = false)' in source and '}, immediate ? 0 : 350);' in source,
    'active_tab_entity_signature': 'relevantEntityIds()' in source and 'runtimeSignature()' in source,
    'identical_markup_not_replaced': 'if (markup === this._lastMarkup) { this.persistInteractionContext(); return; }' in source,
    'incremental_same_view_patch': 'patchMarkup(markup)' in source and 'this._renderedView === this.view' in source,
    'canonical_home_consumption_breakdown': "attrs.demand_export_breakdown_json" in source and "breakdownFor(rowId)" in source,
    'legacy_home_base_absent': 'home_base_load' not in source and "'home_base'" not in source,
    'runtime_update_preserves_viewport': "this._preserveViewportOnRender = true;" in source and "window.scrollTo(viewport.x, viewport.y)" in source,
    'metering_period_hydrates_once': "if (!this._meteringPeriodHydrated)" in source and "this._meteringPeriodHydrated = true;" in source,
    'metering_period_select_writes': "selectMeteringPeriod(scopeSelect.value, 'metering_period_selector')" in source,
    'value_period_select_routes_to_metering': "selectMeteringPeriod(scopeSelect.value, 'value_period_selector')" in source,
    'hour_period_sync_supported': "['hour','today','day','week','month','year']" in source,
    'outlook_selection_not_mutated_on_render': "this.selectedOutlookHorizonId = horizon?.horizon_id" not in source,
    'selected_horizon_has_no_silent_fallback': "|| list.find(h => String(h.horizon_id || '').toUpperCase() === 'D0')" not in source,
    'selected_period_has_no_silent_fallback': "|| list.find(p => String(p.period_id || '').toLowerCase() === 'today')" not in source,
    'strategy_missing_selection_preserved': 'Selected profile temporarily unavailable' in source,
    'lifecycle_context_storage_present': 'homebrain.energy.interaction_context.v1' in source,
    'lifecycle_context_restored_in_constructor': 'const interaction = this.restoreInteractionContext();' in source,
    'restored_metering_period_blocks_rehydration': "Object.prototype.hasOwnProperty.call(interaction, 'selectedMeteringPeriodId')" in source,
    'stable_context_is_whitelisted': 'editDrafts: this.editDrafts' not in source and 'writeFeedback: this.writeFeedback' not in source and 'remediationFeedback: this.remediationFeedback' not in source,
    'scope_selector_has_no_first_item_fallback': '|| normalized[0]' not in source,
    'consumer_sort_default_consistent': "consumerSortSelect.value || 'power'" in source and "consumerSort.dataset.consumerSort || 'power'" in source,
    'local_interaction_state_part_of_render_signature': '${this.loadSort}|${this.meteringSort}|${this.consumerSort}|${this.consumerFilter}' in source,
}
for name, ok in checks.items():
    print(f"{'PASS' if ok else 'FAIL'} {name}")
if not all(checks.values()):
    raise SystemExit(1)
