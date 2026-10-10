#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
files = [p for p in SRC.rglob("*") if p.is_file() and p.suffix in {".js", ".css"} and "vendor" not in p.parts]
texts = {p: p.read_text(encoding="utf-8") for p in files}

errors = []
producer_forbidden = (
    "RHI_ENERGY_MOBILITY_ASSET_TRANSPORT",
    "rhiEnergyMobilityVisualEntry",
    "vehicle_vw_id4",
    "vehicle_audi_q8",
    "vehicle_bmw_x1_phev",
    "vehicle_mercedes_gla",
    "vehicle_renault_scenic_techno_ev",
    "charger_wallbox",
    "charger_peblar",
)
for path, text in texts.items():
    rel = path.relative_to(ROOT)
    if re.search(r"font-family\s*:", text, re.I):
        errors.append(f"{rel}: domain font-family declaration is forbidden; UX Core owns typography")
    for selector in (".rhiUxPageHero", ".rhiUxStatusGrid", ".rhiUxQuickActionBar", ".rhiUxDomainBody"):
        if re.search(re.escape(selector) + r"\s*\{", text):
            errors.append(f"{rel}: shared selector {selector} may only be styled by UX Core")
    if re.search(r"--rhi-font-[\w-]+\s*:", text):
        errors.append(f"{rel}: --rhi-font-* tokens are UX Core-owned")
    for token in producer_forbidden:
        if token in text:
            errors.append(f"{rel}: hardcoded producer visual knowledge is forbidden: {token}")

if (SRC / "assets" / "mobility").exists():
    errors.append("src/assets/mobility must not exist; producer visuals are registry-driven")
if (SRC / "runtime" / "mobility-visual-manifest.js").exists():
    errors.append("src/runtime/mobility-visual-manifest.js must not exist; Foundation registry is authority")

card = texts.get(SRC / "app" / "energy-card.js", "")
for obsolete in ("planningKpiStrip", "gasKpiStrip", "solarProductionStrip", "solarCompactSummaryRow", "gasUseFacts", "summaryRow four", "outlookSummaryStrip", "operationalSummaryGrid"):
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
if "rhiUxPageStack" not in header:
    errors.append("page-header.js: canonical Core page stack class is required")
return_start = header.find('return `<section class="rhiEnergyPageHeader')
if return_start >= 0:
    rendered = header[return_start:]
    positions = [rendered.find("${heroMarkup}"), rendered.find("${statusMarkup}"), rendered.find("${actionsMarkup}")]
    if any(i < 0 for i in positions) or positions != sorted(positions):
        errors.append("page-header.js: rendered DOM order must be hero -> status -> quick actions")

if errors:
    raise SystemExit("\n".join(errors))
print("PASS shared visual ownership: Core grammar + Foundation-registry cross-domain visuals, no producer-specific Energy mapping")
