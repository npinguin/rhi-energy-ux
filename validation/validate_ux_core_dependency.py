from pathlib import Path
import hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]
product=json.loads((ROOT/"release/product.json").read_text()); core=product.get("ux_core") or {}; errors=[]
version=str(core.get("version") or ""); commit=str(core.get("source_commit") or "")
if not re.fullmatch(r"\d+\.\d+\.\d+",version): errors.append("invalid/missing UX Core version")
if not re.fullmatch(r"[0-9a-f]{40}",commit): errors.append("invalid/missing pinned UX Core source commit")
if core.get("runtime_dependency") is not False: errors.append("UX Core must remain build-time only")
if core.get("branding_owner")!="rhi-ux-core": errors.append("shared branding owner must be rhi-ux-core")
vendor=ROOT/"src/vendor/rhi-ux-core.js"
if not vendor.is_file() or vendor.stat().st_size==0: errors.append("pinned UX Core vendor missing")
compat=json.loads((ROOT/"COMPATIBILITY.json").read_text()).get("ux_core") or {}
manifest=json.loads((ROOT/"RELEASE_MANIFEST.json").read_text()).get("ux_core") or {}
for label,data in (("compatibility",compat),("manifest",manifest)):
 if data.get("version")!=version or data.get("source_commit")!=commit: errors.append(label+" UX Core dependency drift")
if errors:
 print("UX CORE RELEASE GATE: FAIL"); [print(" -",e) for e in errors]; raise SystemExit(1)
print("UX CORE RELEASE GATE: PASS"); print("version="+version); print("source_commit="+commit); print("vendor_sha256="+hashlib.sha256(vendor.read_bytes()).hexdigest())
