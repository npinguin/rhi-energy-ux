from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE = (ROOT / 'source' / 'homebrain-energy-card.js').read_text(encoding='utf-8')
DOC = (ROOT / 'docs' / 'UX_FOOTER_STANDARD.md').read_text(encoding='utf-8')

checks = {
    'shared_footer_class': 'rhiUxFooter' in SOURCE,
    'shared_issue_class': 'rhiUxFooterIssue' in SOURCE,
    'expandable_details': '<details class="rhiUxFooterDetails">' in SOURCE and 'rhiUxFooterPanel' in SOURCE,
    'concrete_issue_rows': 'rhiUxFooterProblem' in SOURCE and 'issueLines.map' in SOURCE,
    'healthy_identity': 'RHI Energy UX ${escapeHtml(footer.uxVersion || UX_VERSION)}' in SOURCE and 'Backend ${escapeHtml(backend)}' in SOURCE,
    'readable_geometry': 'justify-content:center!important' in SOURCE and 'color:#64748b!important' in SOURCE and 'font-size:11px!important' in SOURCE and 'opacity:1!important' in SOURCE,
    'separator_contract': '.rhiUxFooter>span+span:before{content:"·"' in SOURCE,
    'warning_colour': '.rhiUxFooterIssue.warning{color:#9a6700!important}' in SOURCE,
    'error_colour': '.rhiUxFooterIssue.error{color:#b42318!important}' in SOURCE,
    'mobile_contract': '@media(max-width:700px){.rhiUxFooter{font-size:10.5px!important' in SOURCE,
    'cache_busted_company_logo': 'company-logo.svg?v=${encodeURIComponent(UX_VERSION)}' in SOURCE,
    'shared_doc_present': 'Hover-only disclosure is not sufficient' in DOC and 'package-versioned URL' in DOC,
}
for name, ok in checks.items():
    print(('PASS' if ok else 'FAIL') + ' ' + name)
if not all(checks.values()):
    sys.exit(1)
