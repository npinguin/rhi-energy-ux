#!/usr/bin/env python3
"""Require independent explicit user approval of an already runtime-qualified stable tag."""
from __future__ import annotations
import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFESTS = {
    "rhi-foundation": "custom_components/rhi_foundation/manifest.json",
    "rhi-mobility": "custom_components/rhi_mobility/manifest.json",
    "rhi-energy": "custom_components/rhi_energy/manifest.json",
    "rhi-mobility-ux": "package.json",
    "rhi-energy-ux": "package.json",
}

def approved(gate: dict, tag: str) -> bool:
    stable = gate.get("stable_release") or {}
    ref = stable.get("user_approval_reference")
    return bool(
        stable.get("user_approval_status") == "APPROVED"
        and stable.get("approved_by") == "USER"
        and stable.get("approved_tag") == tag
        and isinstance(ref, str)
        and re.fullmatch(r"https://github\.com/npinguin/rhi-foundation/issues/129#issuecomment-\d+", ref)
        and stable.get("runtime_validation_required") is True
        and stable.get("explicit_user_approval_required") is True
    )

def main() -> None:
    repo = os.environ.get("GITHUB_REPOSITORY", "").split("/")[-1]
    manifest = MANIFESTS.get(repo)
    if not manifest:
        raise SystemExit("Unsupported RHI package repository")
    gate = json.loads((ROOT / "release/COORDINATED_PUBLICATION_GATE.json").read_text(encoding="utf-8"))
    version = str(json.loads((ROOT / manifest).read_text(encoding="utf-8"))["version"])
    if not approved(gate, "v" + version):
        raise SystemExit("STABLE NO-GO: runtime qualification AND separate explicit user approval required")
    print("User explicitly approved this exact stable tag; separate runtime/provenance checks still required")

if __name__ == "__main__":
    main()
