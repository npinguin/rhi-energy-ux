from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
failures=[]
CANONICAL_PROPERTY_CONTRACT="RHI_ENERGY_CANONICAL_PROPERTY_V1"
LEGACY_V1=re.compile(r"RHI_[A-Z0-9_]+_V1")

def contains_legacy_v1(text: str) -> bool:
    return bool(LEGACY_V1.search(text.replace(CANONICAL_PROPERTY_CONTRACT, "")))

legacy_product=[
    r"sensor\.energy_asset_index(?![a-z0-9_])",
    r"sensor\.energy_relationship_index(?![a-z0-9_])",
    r"sensor\.energy_command_index(?![a-z0-9_])",
    r"sensor\.energy_activity_index(?![a-z0-9_])",
    r"sensor\.energy_planning_index(?![a-z0-9_])",
    r"sensor\.energy_(?:battery|grid|consumption|pricing|strategy|value)_[a-z0-9_]*index(?![a-z0-9_])",
    r"script\.energy_(?:write_public_property|execute_public_command)(?![a-z0-9_])",
]
for path in (ROOT/"src").rglob("*.js"):
    text=path.read_text(encoding="utf-8")
    rel=path.relative_to(ROOT)
    if "!important" in text:
        failures.append(f"{rel}: !important is forbidden; shared geometry belongs to UX Core")
    if contains_legacy_v1(text):
        failures.append(f"{rel}: V1 contract identifier is forbidden in product source")
    for pattern in legacy_product:
        if re.search(pattern,text):
            failures.append(f"{rel}: legacy Energy product API remains: {pattern}")

for path in (ROOT/"validation").rglob("*"):
    if path.suffix not in {".js",".mjs",".py",".json"} or path.name=="validate_zero_debt.py":
        continue
    text=path.read_text(encoding="utf-8")
    if contains_legacy_v1(text):
        failures.append(f"{path.relative_to(ROOT)}: V1 contract identifier is forbidden in active validation fixtures")

for relpath in ("release/product.json","release/RELEASE_STATUS.json","COMPATIBILITY.json","RELEASE_MANIFEST.json"):
    text=(ROOT/relpath).read_text(encoding="utf-8")
    if contains_legacy_v1(text):
        failures.append(f"{relpath}: V1 contract dependency remains in current release metadata")

presentation=(ROOT/"src/app/presentation.js").read_text(encoding="utf-8")
for selector in (".rhiUxPageHero{",".rhiUxStatusGrid{",".rhiUxQuickActionBar{",".rhiUxDomainShell{"):
    if selector in presentation:
        failures.append(f"src/app/presentation.js: shared Core selector authority leaked into Energy: {selector}")

if failures:
    print("\n".join(failures))
    raise SystemExit(1)
print("PASS zero-debt gate: no legacy Energy V1 product authority and shared Core presentation ownership")
