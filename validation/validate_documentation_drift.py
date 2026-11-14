from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
normative = [
    "README.md",
    "docs/ARCHITECTURE.md",
    "docs/BRANDING.md",
    "docs/ENGINEER_HANDOVER.md",
    "docs/RELEASE_GOVERNANCE.md",
    "docs/SOURCE_PACKAGE_GOVERNANCE.md",
    "docs/TEST_GOVERNANCE.md",
    "docs/UX_RELEASE_STANDARD.md",
]
failures = []
for rel in normative:
    text = (ROOT / rel).read_text(encoding="utf-8")
    if "\\n→" in text or "\\n6." in text or "\\n7." in text or "\\n8." in text:
        failures.append(f"{rel}: literal escaped newline artifact")

readme = (ROOT / "README.md").read_text(encoding="utf-8")
branding = (ROOT / "docs/BRANDING.md").read_text(encoding="utf-8")
architecture = (ROOT / "docs/ARCHITECTURE.md").read_text(encoding="utf-8")
handover = (ROOT / "docs/ENGINEER_HANDOVER.md").read_text(encoding="utf-8")
source_gov = (ROOT / "docs/SOURCE_PACKAGE_GOVERNANCE.md").read_text(encoding="utf-8")

for rel, text in (("README.md", readme), ("docs/BRANDING.md", branding)):
    if "source/assets/" in text:
        failures.append(f"{rel}: obsolete canonical asset root")
    if "dist/BUILD_MANIFEST.json" in text:
        failures.append(f"{rel}: obsolete build manifest")
if "source/modules/" in architecture or "source/homebrain-energy-card.js" in architecture:
    failures.append("docs/ARCHITECTURE.md: obsolete source ownership path")
if "source/homebrain-energy-card.js" in handover or "source/modules/" in handover:
    failures.append("docs/ENGINEER_HANDOVER.md: obsolete source ownership path")
for token in ("app/", "runtime/", "domain/", "assets/", "dist/PACKAGE_MANIFEST.json", "Migration sequence"):
    if token not in source_gov:
        failures.append(f"SOURCE_PACKAGE_GOVERNANCE missing {token}")

# Living handover points to current machine authorities, not historical RCs.
for token in ("package.json", "release/product.json", "release/QUALIFICATION.json"):
    if token not in handover:
        failures.append(f"ENGINEER_HANDOVER missing release authority: {token}")
import re
if re.search(r"\b(?:v?\d+\.\d+\.\d+-rc\.\d+|E\d+\.\d+\.\d+)\b", handover):
    failures.append("ENGINEER_HANDOVER contains frozen candidate/backend version")
if "This is not yet a canonical-only release." in architecture:
    failures.append("ARCHITECTURE contains superseded migration status")

if failures:
    raise SystemExit("\n".join(failures))
print("PASS documentation drift: normative Energy paths, package model and migration sequence are current")
