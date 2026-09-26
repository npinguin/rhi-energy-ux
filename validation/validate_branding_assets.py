from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
RUNTIME = (ROOT / "dist" / "rhi-energy-ux.js").read_text(encoding="utf-8")
META = json.loads((ROOT / "src" / "vendor" / "RHI_UX_CORE.json").read_text(encoding="utf-8"))

checks = {
    "core_owns_company_brand": META.get("branding_owner") == "rhi-ux-core",
    "core_brand_primitive_present": "function rhiUxCompanyBrand(" in RUNTIME,
    "core_brand_svg_is_bundled": "RHI_UX_COMPANY_LOGO_SVG" in RUNTIME and "Robotix.be" in RUNTIME,
    "energy_has_no_company_logo_transport": "COMPANY_LOGO_ASSET" not in RUNTIME and "/assets/branding/company-logo.svg" not in RUNTIME,
    "energy_has_no_local_brand_asset": not (ROOT / "src" / "assets" / "branding" / "company-logo.svg").exists(),
}
for name, ok in checks.items():
    print(("PASS" if ok else "FAIL") + " " + name)
if not all(checks.values()):
    sys.exit(1)
