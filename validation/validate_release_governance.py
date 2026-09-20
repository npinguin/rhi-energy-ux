from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]

pkg = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
lock = json.loads((ROOT / "package-lock.json").read_text(encoding="utf-8"))
compat = json.loads((ROOT / "COMPATIBILITY.json").read_text(encoding="utf-8"))
source = (ROOT / "source" / "homebrain-energy-card.js").read_text(encoding="utf-8")
readme = (ROOT / "README.md").read_text(encoding="utf-8")
workflow = (ROOT / ".github" / "workflows" / "release.yml").read_text(encoding="utf-8")
governance = (ROOT / "docs" / "RELEASE_GOVERNANCE.md").read_text(encoding="utf-8")

version = pkg["version"]
checks = {
    "package_lock_version": lock["version"] == version and lock["packages"][""]["version"] == version,
    "compatibility_version": compat["ux_version"] == version,
    "source_version": f"const UX_VERSION = 'R{version}'" in source,
    "backend_version_single_owner": "backend_release: attrs.backend_release || 'unknown'" in source,
    "no_backend_version_fallback": "attrs.backend_version || attrs.backend_release" not in source,
    "immutable_release_tag_guard": 'git rev-parse "v${ACTUAL}"' in workflow,
    "immutable_release_object_guard": 'gh release view "v${ACTUAL}"' in workflow,
    "release_from_main_only": "github.ref == 'refs/heads/main'" in workflow,
    "hacs_resource_documented": "/hacsfiles/rhi-energy-ux/rhi-energy-ux.js" in readme,
    "dashboard_views_documented": "views:" in readme and "custom:homebrain-energy-card" in readme,
    "rollback_documented": "v3.94.7" in readme and "previous immutable HACS release" in governance,
}

failed = [name for name, ok in checks.items() if not ok]
for name, ok in checks.items():
    print(("PASS" if ok else "FAIL") + " " + name)
if failed:
    raise SystemExit("release governance validation failed: " + ", ".join(failed))
