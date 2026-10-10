from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
APP = (ROOT / "src/app/energy-card.js").read_text(encoding="utf-8")
HEADER = (ROOT / "src/ui/components/page-header.js").read_text(encoding="utf-8")
PRESENTATION = (ROOT / "src/app/presentation.js").read_text(encoding="utf-8")
BASELINE = json.loads((ROOT / "governance/UX_DEBT_BASELINE.json").read_text(encoding="utf-8"))

errors = []

# One canonical page header grammar, using Core-owned primitives.
for token in ("rhiUxPageHero(", "rhiUxStatusGrid(", "rhiUxQuickActionBar", "rhiUxPageStack"):
    if token not in HEADER:
        errors.append(f"page header lost Core primitive: {token}")

# Page-level controls are executable commands only. View/filter context is body-scoped.
required = [
    "commandActions = \"\"",
    'class="rhiUxQuickActionBar"',
    "commandActions:this.pageQuickActions(rt, tab)",
    "bodyContextBar(rt, tab",
    'class="rhiUxContextBar"',
]
for token in required:
    if token not in HEADER + APP:
        errors.append(f"missing converged control contract: {token}")

for forbidden in (
    "contextControls:this.pageContextControls(rt, tab)",
    'class="rhiEnergyControlGroup context"',
    'class="rhiEnergyPageControls rhiUxQuickActionBar"',
    "quickActions:this.quickActionBar(rt, tab) + this.pageQuickActions(rt, tab)",
    "quickActionBar(rt, tab) {",
):
    if forbidden in HEADER + APP:
        errors.append(f"legacy mixed page-control authority remains: {forbidden}")

context_start = APP.find("pageContextControls(rt, tab)")
context_end = APP.find("bodyContextBar(rt, tab")
context_block = APP[context_start:context_end]
for expected in ("outlook","consumers","metering","planning","value"):
    if f"tab === '{expected}'" not in context_block:
        errors.append(f"missing body-scoped context case: {expected}")
for forbidden_view_nav in ("Energy flow","Tactical planning","Gas meter","Consumer list"):
    if forbidden_view_nav in context_block:
        errors.append(f"navigation shortcut leaked into body View controls: {forbidden_view_nav}")

if "data:image/" in APP:
    errors.append("embedded binary presentation asset remains in energy-card.js; use packaged assets")

# Legacy presentation authority is closed. Neither rendering nor stylesheet debt may reappear.
for legacy_class in ("hiTabHero", "hiTabStatusGrid", "hiQuickActionBar"):
    if re.search(r'class=[\"\'][^\"\']*' + re.escape(legacy_class), APP):
        errors.append(f"legacy structural markup rendered: {legacy_class}")

# Runtime UX must be capability/contract driven, never branch on a historical
# backend release literal.
runtime_roots = [
    ROOT / "src/app",
    ROOT / "src/domain",
    ROOT / "src/runtime",
    ROOT / "src/ui",
]
release_literal = re.compile(r"\bE\d+\.\d+\.\d+\b")
for root in runtime_roots:
    for path in root.rglob("*.js"):
        text = path.read_text(encoding="utf-8")
        match = release_literal.search(text)
        if match:
            errors.append(f"version-specific backend assumption in {path.relative_to(ROOT)}: {match.group(0)}")

# Presentation Core ownership must remain one-way.
for selector in (".rhiUxPageHero{", ".rhiUxStatusGrid{", ".rhiUxQuickActionBar{"):
    if selector in PRESENTATION:
        errors.append(f"Energy redefines Core-owned selector: {selector}")

# Closed presentation debt baseline. All historical/shared-authority counters are zero and must stay zero.
maxima = BASELINE["maximums"]
counts = {
    "important_declarations": APP.count("!important"),
    "legacy_hiTabHero_mentions": APP.count("hiTabHero"),
    "legacy_hiTabStatusGrid_mentions": APP.count("hiTabStatusGrid"),
    "legacy_hiQuickActionBar_mentions": APP.count("hiQuickActionBar"),
    "historical_r326_mentions": APP.count("r326"),
    "historical_r346_mentions": APP.count("r346"),
}
for key, actual in counts.items():
    maximum = int(maxima[key])
    if actual != maximum:
        errors.append(f"UX debt baseline violated: {key} {actual} != required {maximum}")

if errors:
    raise SystemExit("\n".join(errors))

print("PASS Energy UX convergence: canonical page grammar, semantic controls and debt ratchet")
print("UX debt counts:", ", ".join(f"{k}={v}" for k,v in counts.items()))
