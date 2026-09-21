#!/usr/bin/env python3
"""Build the HACS deployable Energy UX bundle from canonical source.

The source remains the canonical R3.94.20 runtime. Distribution is reproducible:
legacy /local artwork URLs are rewritten to the HACS-owned resource namespace,
and canonical source/assets are synchronized byte-for-byte into dist/assets.
No business semantics are changed here.
"""
from __future__ import annotations

from hashlib import sha256
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAIN = ROOT / "source" / "homebrain-energy-card.js"
DIST_DIR = ROOT / "dist"
DIST = DIST_DIR / "rhi-energy-ux.js"
BUILD_MANIFEST = DIST_DIR / "BUILD_MANIFEST.json"
SOURCE_ASSET_DIR = ROOT / "source" / "assets"
DIST_ASSET_DIR = DIST_DIR / "assets"
PACKAGE = ROOT / "package.json"

MODULES = [
    "runtime/public-interface-registry.js",
    "runtime/energy-contract-gateway.js",
    "runtime/consumption-contract.js",
    "runtime/current-energy-view-model.js",
    "runtime/physical-flow-view-model.js",
    "runtime/metering-status-model.js",
    "runtime/command-contract.js",
    "runtime/command-action-model.js",
    "flexible-assets/domain-model.js",
    "planning/contract-adapter.js",
    "planning/planning-contract.js",
    "planning/planning-view-model.js",
]

LEGACY_ASSET_PREFIX = "/local/homebrain/infrastructure/energy/"
HACS_ASSET_PREFIX = "/hacsfiles/rhi-energy-ux/assets/"


def digest(data: bytes) -> str:
    return sha256(data).hexdigest()


def assert_generated_blocks_are_current(source_text: str) -> None:
    candidate = source_text
    for relative in MODULES:
        module_path = ROOT / "source" / "modules" / relative
        start_marker = f"// BEGIN GENERATED MODULE: {relative}"
        end_marker = f"// END GENERATED MODULE: {relative}"
        if start_marker not in candidate or end_marker not in candidate:
            raise SystemExit(f"Missing generated-module marker for {relative}")
        start = candidate.index(start_marker)
        end = candidate.index(end_marker) + len(end_marker)
        candidate = candidate[:start] + module_path.read_text(encoding="utf-8").strip() + candidate[end:]
    if candidate != source_text:
        raise SystemExit(
            "Canonical source module blocks are stale; synchronize source/modules before building dist"
        )


def main() -> None:
    source_text = MAIN.read_text(encoding="utf-8")
    assert_generated_blocks_are_current(source_text)

    package = json.loads(PACKAGE.read_text(encoding="utf-8"))
    version = package["version"]
    version_marker = "const UX_VERSION = '"
    if version_marker not in source_text:
        raise SystemExit("Source UX_VERSION declaration missing")
    import re
    bundle_text = re.sub(
        r"const UX_VERSION = 'R[^']+'",
        f"const UX_VERSION = 'R{version}'",
        source_text,
        count=1,
    ).replace(LEGACY_ASSET_PREFIX, HACS_ASSET_PREFIX)
    if LEGACY_ASSET_PREFIX in bundle_text:
        raise SystemExit("Legacy /local Energy artwork reference remains in HACS bundle")

    DIST_DIR.mkdir(parents=True, exist_ok=True)
    DIST.write_text(bundle_text, encoding="utf-8", newline="\n")

    company_logo = SOURCE_ASSET_DIR / "company-logo.svg"
    if not company_logo.is_file():
        raise SystemExit("Missing canonical company logo asset: source/assets/company-logo.svg")

    DIST_ASSET_DIR.mkdir(parents=True, exist_ok=True)
    for source_asset in sorted(SOURCE_ASSET_DIR.iterdir()):
        if source_asset.is_file():
            (DIST_ASSET_DIR / source_asset.name).write_bytes(source_asset.read_bytes())

    assets = {}
    for asset in sorted(DIST_ASSET_DIR.glob("*")):
        if asset.is_file():
            assets[asset.name] = {
                "bytes": asset.stat().st_size,
                "sha256": digest(asset.read_bytes()),
            }

    manifest = {
        "schema_version": 1,
        "product": "Robotix Home Intelligence Energy UX",
        "version": version,
        "license": "GPL-3.0-only",
        "source": {
            "path": "source/homebrain-energy-card.js",
            "bytes": MAIN.stat().st_size,
            "sha256": digest(MAIN.read_bytes()),
        },
        "bundle": {
            "path": "dist/rhi-energy-ux.js",
            "bytes": DIST.stat().st_size,
            "sha256": digest(DIST.read_bytes()),
        },
        "assets": assets,
        "distribution_transform": {
            "legacy_asset_prefix": LEGACY_ASSET_PREFIX,
            "hacs_asset_prefix": HACS_ASSET_PREFIX,
        },
    }
    BUILD_MANIFEST.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"Built {DIST.relative_to(ROOT)} ({DIST.stat().st_size} bytes)")
    print(f"SHA256 {manifest['bundle']['sha256']}")


if __name__ == "__main__":
    main()
