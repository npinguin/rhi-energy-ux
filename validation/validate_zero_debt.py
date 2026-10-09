from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
failures=[]
CANONICAL_PROPERTY_CONTRACT="RHI_ENERGY_CANONICAL_PROPERTY_V2"
ALLOWED_NATIVE_CONTRACTS=("RHI_ENERGY_PLANNING_HORIZON_V1",)
LEGACY_V1=re.compile(r"RHI_[A-Z0-9_]+_V1")

def _without_current_contracts(text: str) -> str:
    for name in (CANONICAL_PROPERTY_CONTRACT, *ALLOWED_NATIVE_CONTRACTS):
        text=text.replace(name, "")
    return text

def contains_legacy_v1(text: str) -> bool:
    return bool(LEGACY_V1.search(_without_current_contracts(text)))


semantic_fallback_patterns=[
    r"compatibility fallback",
    r"Transitional aggregate fallback",
    r"canonicalIds\.length\s*\?\s*canonicalIds\s*:\s*\[UX_INTERFACES\.publicV2\]",
    r"return\s+this\.publicV2\(\)\.field\(",
    r"const\s+fallback\s*=\s*\(this\.publicV2\(\)\.allPropertyRows",
    r"rowsForProperty\?\.\('gas\.total_m3'\)",
    r"commandContract\(\)\.rows\.find\([^\n]+\)\s*\|\|\s*row",
]

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
    for pattern in semantic_fallback_patterns:
        if re.search(pattern,text,re.IGNORECASE):
            failures.append(f"{rel}: semantic compatibility fallback remains: {pattern}")

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
print("PASS zero-debt gate: canonical Energy properties fail closed; no semantic compatibility fallback, legacy product authority or shared Core presentation debt")
