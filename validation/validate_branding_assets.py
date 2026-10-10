from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/"src"/"assets"/"branding"/"company-logo.svg"
DIST=ROOT/"dist"/"assets"/"branding"/"company-logo.svg"
VENDOR=(ROOT/"src"/"vendor"/"rhi-ux-core.js").read_text(encoding="utf-8")
CARD=(ROOT/"src"/"app"/"energy-card.js").read_text(encoding="utf-8")

checks={
 "domain_source_logo_absent": not SOURCE.exists(),
 "domain_dist_logo_absent": not DIST.exists(),
 "core_brand_primitive_present": "function rhiUxCompanyBrand(" in VENDOR,
 "approved_brand_copy_present": "Robotix.be" in VENDOR,
 "approved_slogan_present": "DomotiX · Network · Security" in VENDOR,
 "approved_primary_colour_present": "#0B4C86" in VENDOR,
 "approved_slogan_colour_present": "#5B95C8" in VENDOR,
 "energy_uses_core_brand": "rhiUxCompanyBrand()" in CARD or "rhiUxDomainShell(" in CARD,
 "energy_has_no_logo_transport": "COMPANY_LOGO_ASSET" not in CARD and "company-logo.svg" not in CARD,
}
for name,ok in checks.items(): print(("PASS" if ok else "FAIL")+" "+name)
if not all(checks.values()): sys.exit(1)
