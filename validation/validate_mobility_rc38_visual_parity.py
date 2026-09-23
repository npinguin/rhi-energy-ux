from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE = (ROOT / "src" / "app" / "energy-card.js").read_text(encoding="utf-8")
PRESENTATION = (ROOT / "src" / "app" / "presentation.js").read_text(encoding="utf-8")

checks = {
    "canonical_cross_product_contract": "R3.95.2 canonical cross-product top-level composition" in SOURCE,
    "hero_full_bleed_geometry": "min-height:clamp(176px,16vw,218px)!important" in SOURCE and "inset:0 0 0 27%!important" in SOURCE,
    "hero_status_vertical_stack": "grid-template-columns:minmax(0,1fr)!important" in SOURCE and "grid-auto-flow:row!important" in SOURCE and "align-items:stretch!important" in SOURCE,
    "terminal_contract_is_last": SOURCE.rfind("R3.95.3 TERMINAL top-level visual contract") > SOURCE.rfind(".hiTabHeroCopy h2{font-size:24px!important"),
    "hero_location_eyebrow_hidden": ".hiTabHeroCopy>small{display:none!important}" in SOURCE,
    "hero_title_matches_mobility_scale": "font-size:clamp(31px,3.1vw,48px)!important" in SOURCE,
    "hero_purpose_matches_mobility_scale": "font-size:clamp(12px,1.15vw,16px)!important" in SOURCE,
    "hero_has_no_live_substatus": ".hiTabLiveLine,.hiTabHeroBadge{display:none!important}" in SOURCE,
    "status_four_up_until_phone": "grid-template-columns:repeat(4,minmax(0,1fr))!important" in SOURCE and "@media(max-width:760px)" in SOURCE,
    "status_overview_weight": "min-height:94px!important" in SOURCE and "grid-template-columns:52px minmax(0,1fr)!important" in SOURCE,
    "quick_actions_overview_geometry": "min-height:52px!important" in SOURCE and "height:40px!important" in SOURCE and ".hiQuickAction:first-child{background:#0B66F6!important" in SOURCE,
    "battery_has_top_actions": "if (tab === 'battery') controls = button('Energy flow'" in SOURCE,
    "all_tabs_get_action_bar": "if (!controls) controls = button('Overview'" in SOURCE,
    "presentation_semantic_hero_map": "HB_ENERGY_HERO_ASSETS" in PRESENTATION and '"strategic-planning": "heroes/strategies-hero.webp"' in PRESENTATION,
}

for name, ok in checks.items():
    print(("PASS" if ok else "FAIL") + " " + name)

if not all(checks.values()):
    sys.exit(1)
