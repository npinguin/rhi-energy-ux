from hashlib import sha256
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source" / "assets" / "company-logo.svg"
DIST = ROOT / "dist" / "assets" / "company-logo.svg"
RUNTIME = (ROOT / "source" / "homebrain-energy-card.js").read_text(encoding="utf-8")
EXPECTED_SHA256 = "c556ecd0ba29c195ae35540c5a2b4ce218b7e527887ad76ece9ef346e5e02571"

checks = {
    "canonical_company_logo_present": SOURCE.is_file(),
    "distribution_company_logo_present": DIST.is_file(),
    "canonical_company_logo_hash": SOURCE.is_file() and sha256(SOURCE.read_bytes()).hexdigest() == EXPECTED_SHA256,
    "distribution_matches_canonical": SOURCE.is_file() and DIST.is_file() and SOURCE.read_bytes() == DIST.read_bytes(),
    "runtime_uses_canonical_logo_asset": "company-logo.svg" in RUNTIME and "company-logo.webp" not in RUNTIME,
    "company_logo_not_css_recoloured": "filter:saturate" not in RUNTIME and ".navCompanyLogo{filter:" not in RUNTIME,
    "approved_brand_copy_present": "Robotix.be" in SOURCE.read_text(encoding="utf-8") if SOURCE.is_file() else False,
    "approved_slogan_present": "DomotiX · Network · Security" in SOURCE.read_text(encoding="utf-8") if SOURCE.is_file() else False,
}

for name, ok in checks.items():
    print(("PASS" if ok else "FAIL") + " " + name)
if not all(checks.values()):
    sys.exit(1)
