from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

source = (ROOT / "source" / "homebrain-energy-card.js").read_text(encoding="utf-8")
match = re.search(r"understandingFooter\(rt, tab\) \{(?P<body>.*?)\n    \}\n", source, re.S)
if not match:
    raise SystemExit("understandingFooter not found")
body = match.group("body")

checks = {    "balance_vm_declared": "const balanceVm = this.canonicalLiveEnergyBalance(rt);" in body,
    "balance_vm_declared_before_use": body.find("const balanceVm = this.canonicalLiveEnergyBalance(rt);") >= 0 and body.find("const balanceVm = this.canonicalLiveEnergyBalance(rt);") < body.find("balanceVm.battery.socPct"),
    "canonical_solar": "const solar = balanceVm.solarKw;" in body,
    "canonical_grid_import": "const gridImport = balanceVm.gridImportKw;" in body,
    "canonical_grid_export": "const gridExport = balanceVm.gridExportKw;" in body,
    "no_direct_battery_read": "rt.number('battery." not in body and "rt.value('battery." not in body,
    "no_direct_solar_read": "rt.number('solar.power_kw')" not in body,
    "no_direct_grid_read": "rt.number('grid.import_power_kw')" not in body and "rt.number('grid.export_power_kw')" not in body,
    "backend_release_single_owner": "backend_release: attrs.backend_release || 'unknown'" in source,
    "no_backend_release_fallback": "attrs.backend_version || attrs.backend_release" not in source and "attrs.release_version || this.releaseState()?.state" not in source,
    "quiet_footer": "RHI Energy UX ${escapeHtml(footer.uxVersion || UX_VERSION)}" in source and "Backend ${escapeHtml(backend)}" in source,
    "issue_only_colour": 'class="hiReleaseIssue rhiUxFooterIssue ${issue.severity}"' in source,
    "technical_panel_hidden": "diagnosticsPanel() {" in source and "return '';" in source,
    "issue_details_visible": '<details class="rhiUxFooterDetails">' in source and "issueLines.map" in source,
}

failed = [name for name, ok in checks.items() if not ok]
for name, ok in checks.items():
    print(("PASS" if ok else "FAIL") + " " + name)
if failed:
    raise SystemExit("footer runtime guard validation failed: " + ", ".join(failed))
