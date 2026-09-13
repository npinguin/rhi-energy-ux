from pathlib import Path

SOURCE = Path(__file__).resolve().parents[1] / "source" / "homebrain-energy-card.js"
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
