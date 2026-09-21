from pathlib import Path
import json

root = Path(__file__).resolve().parents[1]
version = json.loads((root / 'package.json').read_text(encoding="utf-8"))["version"]
source = (root / 'source' / 'homebrain-energy-card.js').read_text(encoding='utf-8')
checks = {
    'release_identity': f"const UX_VERSION = 'R{version}'" in source,
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
    'two_level_navigation_sections': "id: 'energy'" in source and "id: 'intelligence'" in source and "id: 'insights'" in source,
    'energy_navigation_order': "{ id:'overview', label:'Overview'" in source and "{ id:'flow', label:'Flow'" in source and "{ id:'solar', label:'Solar', view:'solar-generation'" in source,
    'operational_planning_reuses_solar_renderer': "{ id:'operational-planning', label:'Operational Planning', view:'solar'" in source,
    'tactical_planning_reuses_planning_renderer': "{ id:'tactical-planning', label:'Tactical Planning', view:'planning'" in source,
    'strategic_planning_structural_route': "{ id:'strategic-planning', label:'Strategic Planning', view:'strategic-planning'" in source,
    'navigation_context_persisted': 'navSection: this.navSection' in source and 'navItem: this.navItem' in source and 'navSelectionBySection: this.navSelectionBySection' in source,
    'premium_header_owned_by_navigation': 'const semanticTitle = navItem?.title || p.title;' in source and 'hiTabPurpose' in source,
    'legacy_single_row_nav_removed': "['overview','Overview'],['outlook','Outlook']" not in source,
    'old_large_top_header_removed': '<header class="top">' not in source,
    'mobile_navigation_is_scroll_safe': '.navItems.tabs{display:flex!important' in source and '.navSections{width:100%;box-sizing:border-box;display:grid;grid-template-columns:repeat(3' in source,
    'navigation_uses_single_shared_frame': '.navigationShell{--nav-active-bg:' in source and 'border-radius:18px' in source and 'overflow:hidden' in source,
    'navigation_inner_layers_are_light': '.navSections{gap:3px;padding:7px 10px 6px;background:transparent;border:0' in source and 'background:transparent!important;box-shadow:none!important' in source,
    'navigation_section_accents_present': '.navigationShell.nav-intelligence' in source and '.navigationShell.nav-insights' in source,
    'navigation_brand_inside_shared_frame': 'class="navPrimaryRow"' in source and 'class="navBrand"' in source and 'Home Intelligence</b><small>ENERGY</small>' in source,
    'navigation_primary_icons_present': 'class="navSectionIcon"' in source and "energy:'⚡'" in source and "intelligence:'◉'" in source and "insights:'▥'" in source,
    'legacy_external_product_breadcrumb_removed': '<div class="productBrand">' not in source,
    'premium_primary_row_proportions': '.navPrimaryRow{min-height:76px' in source and '.navSectionTab{min-height:46px' in source,
}
for name, ok in checks.items():
    print(f"{'PASS' if ok else 'FAIL'} {name}")
if not all(checks.values()):
    raise SystemExit(1)
