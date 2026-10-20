#!/usr/bin/env python3
"""Fail closed: only a user-requested, exact-main validated one-time HACS TEST."""
from __future__ import annotations
import json
import os
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KEYS = {"foundation", "mobility", "energy", "mobility_ux", "energy_ux"}
REPOSITORIES = {
    "rhi-foundation": ("foundation", "custom_components/rhi_foundation/manifest.json"),
    "rhi-mobility": ("mobility", "custom_components/rhi_mobility/manifest.json"),
    "rhi-energy": ("energy", "custom_components/rhi_energy/manifest.json"),
    "rhi-mobility-ux": ("mobility_ux", "package.json"),
    "rhi-energy-ux": ("energy_ux", "package.json"),
}

def authorized(gate: dict, version: str, repo: str, event: dict, source_sha: str, main_sha: str) -> bool:
    key = REPOSITORIES.get(repo, (None,))[0]
    req = gate.get("test_request") or {}
    matrix = req.get("matrix")
    approved = gate.get("approval") or {}
    if not isinstance(matrix, dict) or set(matrix) != KEYS:
        return False
    if any(not isinstance(v, str) or not re.fullmatch(r"v\d+\.\d+\.\d+(?:-rc\.\d+)?", v) for v in matrix.values()):
        return False
    reference = req.get("request_reference")
    return bool(
        key in KEYS
        and gate.get("publication_hold") is True
        and gate.get("mode") == "EXPLICIT_USER_REQUEST_HACS_TEST"
        and gate.get("authority") == "npinguin/rhi-foundation#129"
        and all(approved.get(name) is None for name in ("source_closure_approved", "five_package_matrix_verified", "foundation_129_approval"))
        and req.get("status") == "AUTHORIZED_FOR_TEST"
        and req.get("requested_by") == "USER"
        and isinstance(req.get("request_id"), str) and bool(req["request_id"].strip())
        and isinstance(reference, str)
        and bool(re.fullmatch(r"https://github\.com/npinguin/rhi-foundation/issues/129#issuecomment-\d+", reference))
        and req.get("channel") == "HACS_TEST_ONLY"
        and req.get("expected_tag") == "v" + version == matrix[key]
        and req.get("stable_promotion") == "NO_GO"
        and req.get("runtime_qualification") in ("NOT_EXECUTED", "IN_PROGRESS", "BLOCKED", "PENDING")
        and req.get("immutable_candidate") is True
        and req.get("release_count_limit") == 1
        and event.get("conclusion") == "success"
        and event.get("head_branch") == "main"
        and event.get("head_sha") == source_sha == main_sha
        and bool(re.fullmatch(r"[a-f0-9]{40}", source_sha))
    )

def main() -> None:
    repo = os.environ.get("GITHUB_REPOSITORY", "").split("/")[-1]
    item = REPOSITORIES.get(repo)
    if not item:
        raise SystemExit("Unsupported RHI package repository")
    gate = json.loads((ROOT / "release/COORDINATED_PUBLICATION_GATE.json").read_text(encoding="utf-8"))
    manifest = json.loads((ROOT / item[1]).read_text(encoding="utf-8"))
    event_data = json.loads(Path(os.environ["GITHUB_EVENT_PATH"]).read_text(encoding="utf-8"))
    event = event_data.get("workflow_run") or {} if os.environ.get("GITHUB_EVENT_NAME") == "workflow_run" else {}
    source_sha = subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip()
    subprocess.run(["git", "fetch", "origin", "main"], check=True, capture_output=True)
    main_sha = subprocess.check_output(["git", "rev-parse", "origin/main"], text=True).strip()
    allowed = os.environ.get("GITHUB_EVENT_NAME") == "workflow_run" and authorized(
        gate, str(manifest["version"]), repo, event, source_sha, main_sha
    )
    with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as output:
        output.write(f"allowed={str(allowed).lower()}\n")
    print("AUTHORIZED: one immutable user-requested HACS TEST; STABLE NO-GO" if allowed
          else "HOLD: no exact user-requested HACS TEST authorization")

if __name__ == "__main__":
    main()
