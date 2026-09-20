from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = (root / 'source' / 'homebrain-energy-card.js').read_text(encoding="utf-8")
checks = {
    'release_identity': "const UX_VERSION = 'R3.94.8'" in source,
    'hour_period_first_class': "{ period_id: 'hour', label: 'This hour', selector_order: 0 }" in source,
    'canonical_home_consumption_property': "canonicalValue('home_consumption.power_kw', 'home_consumption')" in source,
    'canonical_home_consumption_breakdown': "withBreakdown(canonicalValue('home_consumption.power_kw', 'home_consumption'),'home_consumption')" in source,
    'no_home_base_alias': 'home_base_load' not in source and 'home_base' not in source,
    'value_actual_result_complete': "resultCompletenessLabel = actualResultComplete ? 'Actual result complete'" in source,
    'value_scope_separated': 'resultScopeLabel' in source and 'counterfactualEvaluated' in source and 'attributionEvaluated' in source,
    'retrospective_partial_evidence_visible': 'const available=hasEvidence;' in source and 'What the system can already conclude' in source,
    'retrospective_deviations_used': "['deviations_json','deviations']" in source,
}
failed = [name for name, ok in checks.items() if not ok]
for name, ok in checks.items(): print(f"{'PASS' if ok else 'FAIL'} {name}")
if failed: raise SystemExit('R3.94.8 validation failed: ' + ', '.join(failed))
