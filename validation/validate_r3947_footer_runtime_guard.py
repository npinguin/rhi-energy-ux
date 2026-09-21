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
    "technical_panel_hidden": "diagnosticsPanel() {" in source and "return '';" in source,
}

failed = [name for name, ok in checks.items() if not ok]
for name, ok in checks.items():
    print(("PASS" if ok else "FAIL") + " " + name)
if failed:
    raise SystemExit("footer runtime guard validation failed: " + ", ".join(failed))
