from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[1]
meta=json.loads((ROOT/"src/vendor/RHI_UX_CORE.json").read_text(encoding="utf-8"))
product=json.loads((ROOT/"release/product.json").read_text(encoding="utf-8"))
manifest=json.loads((ROOT/"src/manifest.json").read_text(encoding="utf-8"))
vendor=(ROOT/"src/vendor/rhi-ux-core.js").read_text(encoding="utf-8")
presentation=(ROOT/"src/app/presentation.js").read_text(encoding="utf-8")
header=(ROOT/"src/ui/components/page-header.js").read_text(encoding="utf-8")
card=(ROOT/"src/app/energy-card.js").read_text(encoding="utf-8")

authority=product.get("ux_core") or {}
if meta.get("version")!=authority.get("version") or meta.get("source_commit")!=authority.get("source_commit"):
    raise SystemExit("RHI UX Core pin differs from release/product.json authority")
if f'const RHI_UX_CORE_VERSION = "{meta.get("version")}";' not in vendor:
    raise SystemExit("vendored Core runtime version differs from metadata authority")
if meta.get("runtime_dependency") is not False or meta.get("branding_owner")!="rhi-ux-core":
    raise SystemExit("RHI UX Core ownership metadata drift")
if "/hacsfiles/rhi-ux-core" in vendor+presentation+header+card:
    raise SystemExit("runtime dependency on rhi-ux-core is forbidden")
mods=[m for g in manifest["module_groups"] for m in g["modules"]]
for required in ["vendor/rhi-ux-core.js","ui/components/page-header.js"]:
    if required not in mods: raise SystemExit(f"missing bundled Core module: {required}")
if mods.index("vendor/rhi-ux-core.js") > mods.index("ui/components/page-header.js"):
    raise SystemExit("RHI UX Core must load before page-header adapter")
for symbol in ["rhiUxPageHero","rhiUxStatusGrid","rhiUxCoreStyles","rhiUxCompanyBrand","rhiUxContextBar","rhiUxResolveDomainAssetNavigation","rhiUxTranslate","rhiUxFormatNumber","rhiUxPageTemplate","rhiUxAssetFactGrid"]:
    if symbol not in vendor+presentation+header+card: raise SystemExit(f"missing Core integration symbol: {symbol}")
if "__RHI_ASSET_ID__" in vendor: raise SystemExit("stale build-placeholder-style navigation token in Core vendor")
if "{asset_id}" not in vendor: raise SystemExit("runtime-safe cross-domain navigation token missing")
if "COMPANY_LOGO_ASSET" in card:
    raise SystemExit("Energy must not own company-logo transport")
print(f"PASS Energy consumes pinned RHI UX Core {meta.get('version')} including shared visual picker and body-scoped context controls without runtime coupling")
