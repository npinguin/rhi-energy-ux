from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE = (ROOT / 'source' / 'homebrain-energy-card.js').read_text(encoding='utf-8')
DOC = (ROOT / 'docs' / 'UX_FOOTER_STANDARD.md').read_text(encoding='utf-8')

checks = {
    'shared_footer_class': 'rhiUxFooter' in SOURCE,
    'shared_issue_class': 'rhiUxFooterIssue' in SOURCE,
    'healthy_identity': 'RHI Energy UX ${escapeHtml(footer.uxVersion || UX_VERSION)}' in SOURCE and 'Backend ${escapeHtml(backend)}' in SOURCE,
    'quiet_geometry': 'justify-content:center!important' in SOURCE and 'color:#94a3b8!important' in SOURCE and 'font-size:9px!important' in SOURCE,
    'separator_contract': '.rhiUxFooter span+span:before{content:"·"' in SOURCE,
    'warning_colour': '.rhiUxFooterIssue.warning{color:#b7791f!important}' in SOURCE,
    'error_colour': '.rhiUxFooterIssue.error{color:#b42318!important}' in SOURCE,
    'mobile_contract': '@media(max-width:700px){.rhiUxFooter{font-size:8.5px!important' in SOURCE,
    'shared_doc_present': 'RHI <Module> UX <version> · Backend <version>' in DOC,
}
for name, ok in checks.items():
    print(('PASS' if ok else 'FAIL') + ' ' + name)
if not all(checks.values()):
    sys.exit(1)
