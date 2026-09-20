from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]

pkg = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
lock = json.loads((ROOT / "package-lock.json").read_text(encoding="utf-8"))
compat = json.loads((ROOT / "COMPATIBILITY.json").read_text(encoding="utf-8"))
manifest = json.loads((ROOT / "RELEASE_MANIFEST.json").read_text(encoding="utf-8"))
qualification = json.loads((ROOT / "release" / "QUALIFICATION.json").read_text(encoding="utf-8"))
source = (ROOT / "source" / "homebrain-energy-card.js").read_text(encoding="utf-8")
readme = (ROOT / "README.md").read_text(encoding="utf-8")
publish = (ROOT / ".github" / "workflows" / "publish-hacs.yml").read_text(encoding="utf-8")
release = (ROOT / ".github" / "workflows" / "release.yml").read_text(encoding="utf-8")
governance = (ROOT / "docs" / "RELEASE_GOVERNANCE.md").read_text(encoding="utf-8")

version = pkg["version"]
minimum_backend = compat["energy_contract"]["minimum_backend"]

checks = {
    "package_lock_version": lock["version"] == version and lock["packages"][""]["version"] == version,
    "compatibility_version": compat["ux_version"] == version,
    "manifest_version": manifest["version"] == version,
    "qualification_version": qualification["version"] == version,
    "manifest_backend": manifest["minimum_backend"] == minimum_backend,
    "source_version": f"const UX_VERSION = 'R{version}'" in source,
    "backend_version_single_owner": "backend_release: attrs.backend_release || 'unknown'" in source,
    "no_backend_version_fallback": "attrs.backend_version || attrs.backend_release" not in source and "attrs.release_version || this.releaseState()?.state" not in source,
    "validate_side_effect_free": "gh release create" not in (ROOT / ".github" / "workflows" / "validate.yml").read_text(encoding="utf-8"),
    "automatic_candidate_on_main": "push:" in publish and "branches: [main]" in publish,
    "candidate_is_prerelease": "--prerelease" in publish,
    "immutable_tag_guard": "Refusing to republish immutable HACS candidate" in publish,
    "immutable_release_guard": "Refusing to republish immutable GitHub Release" in publish,
    "qualification_does_not_republish": "release/QUALIFICATION.json" not in publish.split("permissions:", 1)[0],
    "stable_is_manual": "workflow_dispatch:" in release and "push:" not in release.split("permissions:", 1)[0],
    "stable_requires_runtime_proof": 'q["runtime_proof"] == "PASS"' in release,
    "stable_requires_rollback_proof": 'q["rollback_proof"] == "PASS"' in release,
    "stable_verifies_candidate_bytes": "cmp dist/rhi-energy-ux.js" in release,
    "hacs_resource_documented": "/hacsfiles/rhi-energy-ux/rhi-energy-ux.js" in readme,
    "dashboard_views_documented": "views:" in readme and "custom:homebrain-energy-card" in readme,
    "rollback_documented": "v3.94.7" in readme and "Previous immutable HACS releases remain the rollback path." in governance,
}

failed = [name for name, ok in checks.items() if not ok]
for name, ok in checks.items():
    print(("PASS" if ok else "FAIL") + " " + name)
if failed:
    raise SystemExit("release governance validation failed: " + ", ".join(failed))
