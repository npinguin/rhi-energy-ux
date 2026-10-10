from pathlib import Path
import json
import re
import shutil
import tempfile

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
manifest = json.loads((DIST / "PACKAGE_MANIFEST.json").read_text(encoding="utf-8"))
product = json.loads((ROOT / "release" / "product.json").read_text(encoding="utf-8"))
publish = (ROOT / ".github" / "workflows" / "publish-hacs.yml").read_text(encoding="utf-8")
stable = (ROOT / ".github" / "workflows" / "release.yml").read_text(encoding="utf-8")

tmp = Path(tempfile.mkdtemp(prefix="rhi-energy-hacs-"))
install = tmp / "www" / "community" / "rhi-energy-ux"
try:
    if product.get("release_asset_policy") != "none":
        raise SystemExit("tagged HACS plugin release must have release_asset_policy=none")
    create_match = re.search(r"gh release create[\s\S]*?^\s*fi", publish, re.MULTILINE)
    create_block = create_match.group(0) if create_match else ""
    for forbidden in ("dist/","COMPATIBILITY.json","RELEASE_MANIFEST.json","QUALIFICATION.json","PACKAGE_MANIFEST.json",".sha256"):
        if forbidden in create_block:
            raise SystemExit(f"publish workflow attaches HACS-diverting GitHub Release asset: {forbidden}")
    if "gh release upload" in publish:
        raise SystemExit("publish workflow must not upload GitHub Release assets")
    if "gh release upload" in stable:
        raise SystemExit("stable workflow must not upload GitHub Release assets")

    simulated_release_assets = []
    if simulated_release_assets:
        raise SystemExit("tagged release assets would override the dist tree")

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
        "assets/heroes/overview-hero.webp",
        "assets/heroes/flow-hero.webp",
    ):
        if not (install / required).is_file():
            raise SystemExit(f"required installed asset missing: {required}")

    if (install / "assets" / "branding").exists():
        raise SystemExit("domain HACS package must not ship company branding; branding belongs to RHI UX Core")

    print(f"PASS HACS tagged-release install simulation (zero release assets -> dist tree): {len(manifest.get('files', []))} files, {len(refs)} asset URLs resolved")
finally:
    shutil.rmtree(tmp, ignore_errors=True)
