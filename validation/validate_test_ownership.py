from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
ownership = json.loads((ROOT / "validation" / "OWNERSHIP.json").read_text(encoding="utf-8"))

for owner_name, owner in ownership.get("owners", {}).items():
    owner_file = ROOT / owner["owner"]
    if not owner_file.is_file():
        raise SystemExit(f"test owner file missing: {owner['owner']}")
    for rel, tokens in owner.get("forbidden_in", {}).items():
        target = ROOT / rel
        if not target.is_file():
            raise SystemExit(f"ownership target missing: {rel}")
        source = target.read_text(encoding="utf-8")
        for token in tokens:
            if token in source:
                raise SystemExit(
                    f"test ownership drift: {rel} asserts {owner_name} invariant via {token!r}; "
                    f"owner is {owner['owner']}"
                )

print("PASS test ownership: one invariant, one owner")
