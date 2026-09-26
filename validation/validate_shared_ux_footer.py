from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE = (ROOT / 'dist' / 'rhi-energy-ux.js').read_text(encoding='utf-8')
DOC = (ROOT / 'docs' / 'UX_FOOTER_STANDARD.md').read_text(encoding='utf-8')

checks = {
    'core_footer_call': 'rhiUxTechnicalFooter({' in SOURCE,
    'core_footer_contract': 'function rhiUxTechnicalFooter(' in SOURCE and 'class="rhiUxTechnicalFooter"' in SOURCE,
    'energy_details': '<details class="rhiEnergyFooterDetails">' in SOURCE,
    'concrete_issue_rows': 'rhiEnergyFooterProblem' in SOURCE and 'issueLines.map' in SOURCE,
    'backend_contract_context': 'Backend ${escapeHtml(backend)} · Contract ${escapeHtml(contract)}' in SOURCE,
    'no_legacy_footer': '<footer class="hiRuntimeFooter rhiUxFooter"' not in SOURCE,
    'shared_doc_present': 'Hover-only disclosure is not sufficient' in DOC,
}
for name, ok in checks.items():
    print(('PASS' if ok else 'FAIL') + ' ' + name)
if not all(checks.values()):
    sys.exit(1)
