from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]\nSOURCE = ROOT / "dist" / "rhi-energy-ux.js"
text = SOURCE.read_text(encoding="utf-8")
errors = []
for symbol in ("holdLabel", "holdCommand", "noUsableSurplus"):
    if symbol in text:
        errors.append(f"stale or undefined renderer symbol remains: {symbol}")
required = [
    "const commandAvailability = actionModels",
    ".filter(action => action.visible && !action.enabled)",
    "humanReason(action.reason, 'Currently unavailable')",
]
for fragment in required:
    if fragment not in text:
        errors.append(f"missing structural command rendering fragment: {fragment}")
if errors:
    raise SystemExit("\n".join(errors))
print("renderer reference integrity: PASS")

# Canonical Gas page hero must be an immutable dedicated page-level asset.
presentation=(ROOT/"src/app/presentation.js").read_text(encoding="utf-8")
gas_hero=ROOT/"src/assets/heroes/gas-page-hero-v2.webp"
if 'gas: "heroes/gas-page-hero-v2.webp"' not in presentation:
    raise SystemExit("Gas page hero mapping drift")
if not gas_hero.is_file():
    raise SystemExit("Gas page hero v2 asset missing")
if 'gas: "heroes/gas-hero.webp"' in presentation:
    raise SystemExit("legacy Gas page hero remains mapped")
