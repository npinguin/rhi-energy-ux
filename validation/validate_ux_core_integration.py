from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[1]
meta=json.loads((ROOT/"src/vendor/RHI_UX_CORE.json").read_text(encoding="utf-8"))
manifest=json.loads((ROOT/"src/manifest.json").read_text(encoding="utf-8"))
vendor=(ROOT/"src/vendor/rhi-ux-core.js").read_text(encoding="utf-8")
presentation=(ROOT/"src/app/presentation.js").read_text(encoding="utf-8")
header=(ROOT/"src/ui/components/page-header.js").read_text(encoding="utf-8")
card=(ROOT/"src/app/energy-card.js").read_text(encoding="utf-8")

if meta.get("version")!="1.2.0":
    raise SystemExit("unexpected RHI UX Core version")
if meta.get("source_commit")!="9c3f60942a1cf68ce30f33c68b532213d7868570":
    raise SystemExit("RHI UX Core source commit drift")
if meta.get("runtime_dependency") is not False:
    raise SystemExit("RHI UX Core must be build-time only")
if "/hacsfiles/rhi-ux-core" in vendor+presentation+header+card:
    raise SystemExit("runtime dependency on rhi-ux-core is forbidden")
mods=[m for g in manifest["module_groups"] for m in g["modules"]]
for required in ["vendor/rhi-ux-core.js","ui/components/page-header.js"]:
    if required not in mods:
        raise SystemExit(f"missing bundled Core module: {required}")
if mods.index("vendor/rhi-ux-core.js") > mods.index("ui/components/page-header.js"):
    raise SystemExit("RHI UX Core must load before page-header adapter")
for symbol in ["rhiUxPageHero","rhiUxStatusGrid","rhiUxDomainShell","rhiUxTechnicalFooter","rhiUxCoreStyles"]:
    if symbol not in vendor+presentation+header:
        raise SystemExit(f"missing Core integration symbol: {symbol}")
start=card.find("tabExperienceHeader(rt")
end=card.find("measuredAssetPower(",start)
slice_=card[start:end if end!=-1 else None]
if "rhiEnergyPageHeader(" not in slice_:
    raise SystemExit("Energy page header is not delegated to RHI UX Core")
if "hiTabHero" in slice_ or "hiTabStatusGrid" in slice_:
    raise SystemExit("legacy Energy header markup still active")
if "rhiUxDomainShell({" not in card:
    raise SystemExit("Energy navigation shell is not delegated to RHI UX Core")
if "rhiUxTechnicalFooter({" not in card:
    raise SystemExit("Energy technical footer is not delegated to RHI UX Core")
for legacy in ['<div class="navigationShell', '<footer class="hiRuntimeFooter rhiUxFooter"']:
    if legacy in card:
        raise SystemExit(f"legacy shared presentation markup still active: {legacy}")
print("PASS Energy consumes pinned RHI UX Core 1.2.0 for shared shell/hero/status/footer without runtime coupling")
