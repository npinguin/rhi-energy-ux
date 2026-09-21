from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
manifest = json.loads((SRC / "manifest.json").read_text(encoding="utf-8"))
ownership = json.loads((SRC / "OWNERSHIP.json").read_text(encoding="utf-8"))

if ownership.get("principle") != "one source concern, one owner":
    raise SystemExit("source ownership principle drift")

for name, owner in ownership.get("owners", {}).items():
    owner_path = ROOT / owner["path"]
    if name != "package" and not owner_path.exists():
        raise SystemExit(f"source owner path missing: {owner['path']}")

template_path = SRC / manifest["template"]
template = template_path.read_text(encoding="utf-8")
if template.count("__RHI_UX_VERSION__") != 1:
    raise SystemExit("app template must own exactly one UX version placeholder")

seen = set()
for group in manifest.get("module_groups", []):
    placeholder = group["placeholder"]
    if template.count(placeholder) != 1:
        raise SystemExit(f"template placeholder drift: {placeholder}")
    for rel in group.get("modules", []):
        if rel in seen:
            raise SystemExit(f"module registered twice: {rel}")
        seen.add(rel)
        path = SRC / rel
        if not path.is_file():
            raise SystemExit(f"canonical module missing: src/{rel}")
        text = path.read_text(encoding="utf-8")
        if "BEGIN GENERATED MODULE:" in text or "END GENERATED MODULE:" in text:
            raise SystemExit(f"generated-copy marker remains in canonical module: src/{rel}")

if (ROOT / "source").exists():
    raise SystemExit("legacy source/ tree remains; canonical source root is src/")

if "/local/homebrain/infrastructure/energy/" in template:
    raise SystemExit("legacy /local Energy asset dependency remains in app template")

print(f"PASS source ownership: {len(seen)} canonical modules, manifest-owned insertion order, no duplicate source tree")
