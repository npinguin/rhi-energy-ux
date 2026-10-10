from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src" / "assets"
DIST = ROOT / "dist" / "assets"
ALLOWED = {".svg", ".webp", ".png", ".jpg", ".jpeg"}
SAFE = re.compile(r"^[a-z0-9][a-z0-9_.-]*$")

def inventory(root: Path):
    rows = []
    for path in sorted(p for p in root.rglob("*") if p.is_file()):
        rel = path.relative_to(root)
        for part in rel.parts:
            if not SAFE.fullmatch(part):
                raise SystemExit(f"unsafe asset path segment: {rel.as_posix()}")
        if path.suffix.lower() not in ALLOWED:
            raise SystemExit(f"unsupported asset extension: {rel.as_posix()}")
        rows.append(rel.as_posix())
    return rows

source_files = inventory(SRC)
dist_files = inventory(DIST)
if source_files != dist_files:
    raise SystemExit("src/assets and dist/assets inventories differ")

for rel in source_files:
    if (SRC / rel).read_bytes() != (DIST / rel).read_bytes():
        raise SystemExit(f"packaged asset differs from canonical source: {rel}")

bundle = (ROOT / "dist" / "rhi-energy-ux.js").read_text(encoding="utf-8")
refs = sorted(set(re.findall(r"/hacsfiles/rhi-energy-ux/assets/([a-z0-9_./-]+\.(?:svg|webp|png|jpg|jpeg))", bundle)))
for rel in refs:
    if rel not in source_files:
        raise SystemExit(f"runtime references missing packaged asset: {rel}")

if "/local/homebrain/infrastructure/energy/" in bundle:
    raise SystemExit("legacy /local Energy artwork reference remains in bundle")

print(f"PASS asset policy: {len(source_files)} canonical assets, {len(refs)} runtime references, source/dist byte parity")
