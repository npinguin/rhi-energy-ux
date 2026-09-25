from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = (root / 'dist' / 'rhi-energy-ux.js').read_text(encoding="utf-8")
checks = {    'hour_period_first_class': "{ period_id: 'hour', label: 'This hour', selector_order: 0 }" in source,
    'canonical_home_consumption_property': 'home_consumption.power_kw' in source and 'readLiveConsumptionContract' in source,
    'canonical_home_consumption_breakdown': 'balanceVm.homeConsumptionKw' in source and "value:fmtKw(balanceVm.homeConsumptionKw,'—')" in source,
    'no_home_base_alias': 'home_base_load' not in source and 'home_base' not in source,
    'value_actual_result_complete': 'actual_complete === true' in source and 'Actual result complete' in source,
    'value_scope_separated': 'resultScopeLabel' in source and 'counterfactualEvaluated' in source and 'attributionEvaluated' in source,
    'retrospective_partial_evidence_visible': 'const available=hasEvidence;' in source and 'What the system can already conclude' in source,
    'retrospective_deviations_used': "['deviations_json','deviations']" in source,
}
failed = [name for name, ok in checks.items() if not ok]
for name, ok in checks.items(): print(f"{'PASS' if ok else 'FAIL'} {name}")
if failed: raise SystemExit('validation failed: ' + ', '.join(failed))
