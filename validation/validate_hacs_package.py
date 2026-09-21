from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
pkg = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
hacs = json.loads((ROOT / "hacs.json").read_text(encoding="utf-8"))
manifest = json.loads((DIST / "PACKAGE_MANIFEST.json").read_text(encoding="utf-8"))
publish = (ROOT / ".github/workflows/publish-hacs.yml").read_text(encoding="utf-8")

if hacs.get("filename") != "rhi-energy-ux.js":
    raise SystemExit("HACS filename drift")
if hacs.get("zip_release") is True:
    raise SystemExit("zip_release is outside the supported plugin package model")
if manifest.get("version") != pkg.get("version"):
    raise SystemExit("package manifest version drift")
if manifest.get("hacs_package_root") != "dist":
    raise SystemExit("HACS package root must be dist")
if manifest.get("hacs_filename") != hacs.get("filename"):
    raise SystemExit("package manifest/HACS filename drift")

allowed_top = {"rhi-energy-ux.js", "rhi-energy-ux.js.sha256", "PACKAGE_MANIFEST.json", "assets"}
for entry in DIST.iterdir():
    if entry.name not in allowed_top:
        raise SystemExit(f"unexpected dist top-level entry: {entry.name}")

for category in ("branding", "heroes"):
    if category not in manifest.get("asset_categories", []):
        raise SystemExit(f"package asset category missing: {category}")
    if not (DIST / "assets" / category).is_dir():
        raise SystemExit(f"dist asset category missing: {category}")

for row in manifest.get("files", []):
    path = DIST / row["path"]
    if not path.is_file():
        raise SystemExit(f"package manifest file missing: {row['path']}")
    if path.stat().st_size != row["bytes"]:
        raise SystemExit(f"package manifest size drift: {row['path']}")

checksum = (DIST / "rhi-energy-ux.js.sha256").read_text(encoding="utf-8").strip().split()[0]
if manifest.get("runtime_sha256") != checksum:
    raise SystemExit("package manifest runtime checksum drift")

if re.search(r"gh release create[\s\S]*dist/rhi-energy-ux\.js(?:\s|\\)", publish):
    raise SystemExit("JS release asset would force HACS single-file mode and drop nested assets")
if "dist/PACKAGE_MANIFEST.json" not in publish:
    raise SystemExit("release must attach package manifest evidence")

print("PASS HACS package: immutable tag dist tree contains runtime + structured assets; release assets are evidence-only")
