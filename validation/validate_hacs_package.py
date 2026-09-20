from pathlib import Path
import json
import re
import sys

root = Path(__file__).resolve().parents[1]
hacs = json.loads((root / "hacs.json").read_text(encoding="utf-8"))
compat = json.loads((root / "COMPATIBILITY.json").read_text(encoding="utf-8"))
pkg = json.loads((root / "package.json").read_text(encoding="utf-8"))
bundle = root / "dist" / "rhi-energy-ux.js"

checks = {
    "hacs_filename": hacs.get("filename") == "rhi-energy-ux.js",
    "hide_default_branch": hacs.get("hide_default_branch") is True,
    "bundle_exists": bundle.is_file(),
    "license": pkg.get("license") == "GPL-3.0-only",
    "version_match": compat.get("ux_version") == pkg.get("version"),
    "contract_minimum": compat.get("energy_contract", {}).get("minimum") == "R1.89.44_CONTRACT",
    "minimum_backend": compat.get("energy_contract", {}).get("minimum_backend") == "E0.15.12",
    "rollback_mode": compat.get("deployment", {}).get("rollback") == "immutable_github_release",
    "no_legacy_local": "/local/homebrain/infrastructure/energy/" not in bundle.read_text(encoding="utf-8"),
    "hacs_asset_prefix": "/hacsfiles/rhi-energy-ux/assets/" in bundle.read_text(encoding="utf-8"),
}
for ref in sorted(set(re.findall(r"/hacsfiles/rhi-energy-ux/assets/([^'\")]+)", bundle.read_text(encoding="utf-8")))):
    checks[f"asset:{ref}"] = (root / "dist" / "assets" / ref).is_file()

for key, ok in checks.items():
    print(("PASS" if ok else "FAIL"), key)
if not all(checks.values()):
    sys.exit(1)
