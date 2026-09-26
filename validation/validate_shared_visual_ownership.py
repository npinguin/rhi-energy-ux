#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
files = [p for p in SRC.rglob("*") if p.is_file() and p.suffix in {".js", ".css"} and "vendor" not in p.parts]
texts = {p: p.read_text(encoding="utf-8") for p in files}

errors = []
for path, text in texts.items():
    rel = path.relative_to(ROOT)
    if re.search(r"font-family\s*:", text, re.I):
        errors.append(f"{rel}: domain font-family declaration is forbidden; UX Core owns typography")
    for selector in (".rhiUxPageHero", ".rhiUxStatusGrid", ".rhiUxQuickActionBar", ".rhiUxDomainBody"):
        if re.search(re.escape(selector) + r"\s*\{", text):
            errors.append(f"{rel}: shared selector {selector} may only be styled by UX Core")
    if re.search(r"--rhi-font-[\w-]+\s*:", text):
        errors.append(f"{rel}: --rhi-font-* tokens are UX Core-owned")

card = texts.get(SRC / "app" / "energy-card.js", "")
for obsolete in (
    "planningKpiStrip", "gasKpiStrip", "solarProductionStrip",
    "summaryRow four", "outlookSummaryStrip", "operationalSummaryGrid",
    "solarCompactSummaryRow", "gasUseFacts"
):
    if f'class="{obsolete}' in card or f"class='{obsolete}" in card:
        errors.append(f"src/app/energy-card.js: obsolete duplicate top status surface {obsolete} remains")
if '<main class="energy rhiUxDomainBody rhi-ux-root">' not in card:
    errors.append("src/app/energy-card.js: Energy root must consume Core body/typography classes")

header = texts.get(SRC / "ui" / "components" / "page-header.js", "")
order = [header.find("heroMarkup"), header.find("statusMarkup"), header.find("actionsMarkup")]
if any(i < 0 for i in order) or order != sorted(order):
    errors.append("page-header.js: canonical order must be hero -> status -> quick actions")
if "rhiUxQuickActionBar" not in header:
    errors.append("page-header.js: page actions must use Core quick-action bar")
if "rhiEnergyPageHeader rhiUxPageStack" not in header:
    errors.append("page-header.js: canonical Energy header must use Core page-stack ordering")

if errors:
    raise SystemExit("\n".join(errors))
print("PASS shared visual ownership: Core owns typography, hero, status, quick actions and body grammar")
