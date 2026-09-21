#!/usr/bin/env python3
from pathlib import Path
import json, re, sys
import tinycss2

root = Path(__file__).resolve().parents[1]
source = (root/'dist/rhi-energy-ux.js').read_text(encoding='utf-8')
manifest = json.loads((root/'MANIFEST.json').read_text(encoding='utf-8'))
evidence = json.loads((root/'RELEASE_EVIDENCE.json').read_text(encoding='utf-8'))

style_start = source.index('    styles() { return `') + len('    styles() { return `')
style_end = source.index('\n`;\n    }\n  }', style_start)
css = source[style_start:style_end]
rules = tinycss2.parse_stylesheet(css, skip_whitespace=True, skip_comments=False)
selectors=[]
def walk(items):
    for rule in items:
        if rule.type == 'qualified-rule':
            selectors.append(tinycss2.serialize(rule.prelude).strip())
        elif rule.type == 'at-rule' and rule.content is not None:
            walk(tinycss2.parse_rule_list(rule.content, skip_whitespace=True, skip_comments=False))
walk(rules)

canonical_selectors = [
    '.overviewCoreGrid', '.overviewHouseHero', '.overviewEnergyRow',
    '.chargingConnectionGrid', '.flowConnectionCard', '.flowPhysicalConsumerCard',
    '.batteryContributorCard', '.batteryContributorImage'
]

def selector_owner_count(token):
    return sum(1 for selector in selectors if token in selector)

checks = {
    'release_identity': manifest.get('release') == 'R3.94.9' and evidence.get('release') == 'R3.94.9' and "const UX_VERSION = 'R3.94.9'" in source,
    'strict_command_role': "const roleFor = row => String(row.role || '').trim().toLowerCase();" in source and 'command_role, row.action_role' not in source,
    'command_invalid_fails_closed': "row.contract_valid === true" in source,
    'connection_zero_null_distinct': "const powerText = power === null ? '—' : fmtKw(power);" in source,
    'metering_visibility_explicit': "const visible = row.ux_visible === true;" in source,
    'overview_no_local_supply_total': 'Known supply' not in source and 'supplyText' not in source,
    'overview_no_grid_advice_inference': "gridDirection === 'Exporting' ? 'Using solar locally" not in source,
    'canonical_style_marker_once': source.count('R3.94.9 canonical core-tab stylesheet') == 1,
    'no_previous_core_override_markers': all(marker not in css for marker in ['R3.92.6 corrective composition','R3.92.7 surgical corrective overrides','R3.93.0 canonical Overview composition']),
    'canonical_selector_owners_present': all(selector_owner_count(token) >= 1 for token in canonical_selectors),
    'no_broken_repeated_overview_selectors': '.overviewGlancePanel\n.overviewGlancePanel' not in css and '.overviewDemandPanel\n.overviewDemandPanel' not in css,
    'maintainability_documented': all((root/'documentation'/name).exists() for name in ['MAINTAINABILITY_STANDARD.md','SCREEN_CONTRACT_MATRIX.md','UX_USAGE_MODEL.md','UX_USAGE_MODEL.xlsx']),
    'runtime_not_overclaimed': evidence.get('runtime_status') == 'NOT_PROVEN' and evidence.get('runtime_proof') is False,
}

failed=[name for name,value in checks.items() if not value]
for name,value in checks.items():
    print(('PASS' if value else 'FAIL'), name)
if failed:
    sys.exit(1)
