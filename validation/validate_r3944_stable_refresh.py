from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = (root / 'source' / 'homebrain-energy-card.js').read_text(encoding='utf-8')
checks = {
    'release_identity': "const UX_VERSION = 'R3.94.8'" in source,
    'metering_records_owner': "const recordRows = this.meteringRowsFromRecords(rt, periodId);" in source,
    'metering_summary_quality_only': "summary:{ quality:selectedSummary }" in source,
    'metering_no_summary_measured_projection': "firstDefined(selectedSummary.measured,selectedSummary.values" not in source,
    'metering_zero_preserved': "value:asNumber(firstDefined(record?.energy_kwh,record?.value))" in source,
    'active_view_restored': "window.sessionStorage.getItem('homebrain.energy.active_view')" in source,
    'active_view_persisted': "window.sessionStorage.setItem('homebrain.energy.active_view', this.view)" in source,
    'render_coalesced': 'scheduleRender(immediate = false)' in source and '}, immediate ? 0 : 350);' in source,
    'active_tab_entity_signature': 'relevantEntityIds()' in source and 'runtimeSignature()' in source,
    'identical_markup_not_replaced': 'if (markup === this._lastMarkup) return;' in source,
    'incremental_same_view_patch': 'patchMarkup(markup)' in source and 'this._renderedView === this.view' in source,
    'canonical_home_consumption_breakdown': "attrs.demand_export_breakdown_json" in source and "breakdownFor(rowId)" in source,
    'legacy_home_base_absent': 'home_base_load' not in source and "'home_base'" not in source,
}
for name, ok in checks.items():
    print(f"{'PASS' if ok else 'FAIL'} {name}")
if not all(checks.values()):
    raise SystemExit(1)
