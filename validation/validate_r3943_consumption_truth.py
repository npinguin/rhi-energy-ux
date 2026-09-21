from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = (root / 'source/homebrain-energy-card.js').read_text(encoding="utf-8")
checks = {
    'release_identity': "const UX_VERSION = 'R3.94.12'" in source,
    'home_consumption_not_reconstructed': "value:fmtKw(balanceVm.homeConsumptionKw,'—')" in source,
    'flexible_load_null_not_zero': "value:fmtKw(balanceVm.flexibleLoadsKw,'—')" in source,
    'incomplete_explanation': 'Unavailable · Flexible Load power incomplete' in source,
    'flow_connection_class_scoped': 'class="flowConnectionCard"' in source,
    'flow_consumer_class_scoped': 'class="flowPhysicalConsumerCard"' in source,
    'generic_flow_card_markup_removed': 'class="consumerCard"' not in source and 'class="chargerCard"' not in source,
    'generic_flow_css_removed': '.consumerCard{' not in source and '.chargerCard{' not in source,
    'one_flow_style_owner': source.count('.flowConnectionCard,.flowPhysicalConsumerCard{') == 1,
}
failed=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(('PASS' if v else 'FAIL'), k)
if failed: raise SystemExit('Failed: '+', '.join(failed))
