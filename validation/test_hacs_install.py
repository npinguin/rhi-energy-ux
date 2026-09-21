from pathlib import Path
import json
import re
import shutil
import tempfile

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
manifest = json.loads((DIST / "PACKAGE_MANIFEST.json").read_text(encoding="utf-8"))

tmp = Path(tempfile.mkdtemp(prefix="rhi-energy-hacs-"))
install = tmp / "www" / "community" / "rhi-energy-ux"
try:
    shutil.copytree(DIST, install)
    allowed = {"rhi-energy-ux.js", "rhi-energy-ux.js.sha256", "PACKAGE_MANIFEST.json", "assets"}
    extra = {p.name for p in install.iterdir()} - allowed
    if extra:
        raise SystemExit(f"unexpected installed top-level entries: {sorted(extra)}")

    for row in manifest.get("files", []):
        path = install / row["path"]
        if not path.is_file():
            raise SystemExit(f"simulated HACS install missing: {row['path']}")
        if path.stat().st_size != row["bytes"]:
            raise SystemExit(f"simulated HACS install size mismatch: {row['path']}")

    bundle = (install / "rhi-energy-ux.js").read_text(encoding="utf-8")
    refs = sorted(set(re.findall(r"/hacsfiles/rhi-energy-ux/assets/([a-z0-9_./-]+\.(?:svg|webp|png|jpg|jpeg))", bundle)))
    for rel in refs:
        if not (install / "assets" / rel).is_file():
            raise SystemExit(f"bundle URL has no installed asset: {rel}")

    for required in (
        "assets/branding/company-logo.svg",
        "assets/heroes/overview-hero.webp",
        "assets/heroes/flow-hero.webp",
    ):
        if not (install / required).is_file():
            raise SystemExit(f"required installed asset missing: {required}")

    print(f"PASS HACS install simulation: {len(manifest.get('files', []))} files, {len(refs)} asset URLs resolved")
finally:
    shutil.rmtree(tmp, ignore_errors=True)
