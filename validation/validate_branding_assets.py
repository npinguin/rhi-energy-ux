from hashlib import sha256
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source" / "assets" / "company-logo.svg"
DIST = ROOT / "dist" / "assets" / "company-logo.svg"
RUNTIME = (ROOT / "source" / "homebrain-energy-card.js").read_text(encoding="utf-8")
EXPECTED_SHA256 = "264f0d86798a2a53e30b8beb5cae366e4b0916adbb3716b3deb23b5ddbed053d"

source_text = SOURCE.read_text(encoding="utf-8") if SOURCE.is_file() else ""

checks = {
    "canonical_company_logo_present": SOURCE.is_file(),
    "distribution_company_logo_present": DIST.is_file(),
    "canonical_company_logo_hash": SOURCE.is_file() and sha256(SOURCE.read_bytes()).hexdigest() == EXPECTED_SHA256,
    "distribution_matches_canonical": SOURCE.is_file() and DIST.is_file() and SOURCE.read_bytes() == DIST.read_bytes(),
    "runtime_uses_single_logo_constant": "const COMPANY_LOGO_ASSET" in RUNTIME and 'company-logo.svg' in RUNTIME,
    "runtime_does_not_embed_company_artwork": "<title id=\"title\">Robotix.be</title>" not in RUNTIME,
    "company_logo_not_css_recoloured": "filter:saturate" not in RUNTIME and ".navCompanyLogo{filter:" not in RUNTIME,
    "transparent_vector_asset": "<rect" not in source_text and "background" not in source_text,
    "approved_brand_copy_present": "Robotix.be" in source_text,
    "approved_slogan_present": "DomotiX · Network · Security" in source_text,
    "approved_primary_colour_present": "#0B4C86" in source_text,
    "approved_slogan_colour_present": "#5B95C8" in source_text,
    "portable_brand_slot_tokens_present": "--rhi-company-logo-max-width" in RUNTIME and "--rhi-company-logo-max-height" in RUNTIME,
}

for name, ok in checks.items():
    print(("PASS" if ok else "FAIL") + " " + name)
if not all(checks.values()):
    sys.exit(1)
