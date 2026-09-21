from pathlib import Path
import json
import re
import sys

root = Path(__file__).resolve().parents[1]
hacs = json.loads((root / "hacs.json").read_text(encoding="utf-8"))
pkg = json.loads((root / "package.json").read_text(encoding="utf-8"))
bundle = root / "dist" / "rhi-energy-ux.js"
bundle_text = bundle.read_text(encoding="utf-8")
build_manifest = json.loads((root / "dist" / "BUILD_MANIFEST.json").read_text(encoding="utf-8"))

checks = {
    "hacs_filename": hacs.get("filename") == "rhi-energy-ux.js",
    "hide_default_branch": hacs.get("hide_default_branch") is True,
    "bundle_exists": bundle.is_file(),
    "license": pkg.get("license") == "GPL-3.0-only",
    "no_legacy_local": "/local/homebrain/infrastructure/energy/" not in bundle_text,
    "hacs_asset_prefix": "/hacsfiles/rhi-energy-ux/assets/" in bundle_text,
    "build_manifest_bundle_path": build_manifest.get("bundle", {}).get("path") == "dist/rhi-energy-ux.js",
}

for raw_ref in sorted(set(re.findall(r"/hacsfiles/rhi-energy-ux/assets/([^'\")]+)", bundle_text))):
    ref = raw_ref.split("?", 1)[0]
    checks[f"asset:{ref}"] = (root / "dist" / "assets" / ref).is_file()

for key, ok in checks.items():
    print(("PASS" if ok else "FAIL"), key)
if not all(checks.values()):
    sys.exit(1)
