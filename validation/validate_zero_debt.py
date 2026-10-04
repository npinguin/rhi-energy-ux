from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
failures=[]

legacy_product=[
    r"sensor\.energy_asset_index",
    r"sensor\.energy_relationship_index",
    r"sensor\.energy_command_index",
    r"sensor\.energy_activity_index",
    r"sensor\.energy_planning_index",
    r"sensor\.energy_(?:battery|grid|consumption|pricing|strategy|value)_[a-z0-9_]*index",
    r"script\.energy_(?:write_public_property|execute_public_command)",
]
for path in (ROOT/"src").rglob("*.js"):
    text=path.read_text(encoding="utf-8")
    rel=path.relative_to(ROOT)
    if "!important" in text:
        failures.append(f"{rel}: !important is forbidden; shared geometry belongs to UX Core")
    for pattern in legacy_product:
        if re.search(pattern,text):
            failures.append(f"{rel}: legacy Energy product API remains: {pattern}")

presentation=(ROOT/"src/app/presentation.js").read_text(encoding="utf-8")
for selector in (".rhiUxPageHero{",".rhiUxStatusGrid{",".rhiUxQuickActionBar{",".rhiUxDomainShell{"):
    if selector in presentation:
        failures.append(f"src/app/presentation.js: shared Core selector authority leaked into Energy: {selector}")

if failures:
    print("\n".join(failures))
    raise SystemExit(1)
print("PASS zero-debt gate: V2-only Energy product authority and shared Core presentation ownership")
