from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]

def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")

def load(rel):
    return json.loads(read(rel))

pkg = load("package.json")
lock = load("package-lock.json")
product = load("release/product.json")
compat = load("COMPATIBILITY.json")
manifest = load("RELEASE_MANIFEST.json")
qualification = load("release/QUALIFICATION.json")
status = load("release/RELEASE_STATUS.json")
ownership = load("validation/OWNERSHIP.json")

source = read("source/homebrain-energy-card.js")
build = read("source/build-energy-bundle.py")
readme = read("README.md")
notes = read("release/RELEASE_NOTES.md")
changelog = read("CHANGELOG.md")
publish = read(".github/workflows/publish-hacs.yml")
validate = read(".github/workflows/validate.yml")
release = read(".github/workflows/release.yml")
governance = read("docs/RELEASE_GOVERNANCE.md")
test_governance = read("docs/TEST_GOVERNANCE.md")
shared_release = read("docs/UX_RELEASE_STANDARD.md")
maintainability = read("docs/MAINTAINABILITY.md")
architecture = read("docs/ARCHITECTURE.md")
drift = read("docs/DRIFT_PREVENTION.md")

version = str(pkg["version"])
tag = f"v{version}"
contract = product["contract"]

checks = {
    "package_lock_version": lock["version"] == version and lock["packages"][""]["version"] == version,
    "compatibility_version": compat["ux_version"] == version,
    "manifest_version": manifest["version"] == version,
    "qualification_version": qualification["version"] == version,
    "qualification_tag": qualification.get("candidate_tag") == tag,
    "qualification_sha_shape": qualification.get("candidate_sha") == "pending" or bool(re.fullmatch(r"[0-9a-fA-F]{40}", str(qualification.get("candidate_sha", "")))),
    "release_status_version": status["source_candidate_version"] == version,
    "contract_from_descriptor": compat["energy_contract"]["minimum"] == contract and manifest["energy_contract"] == contract and status["contract"] == contract,
    "minimum_backend_from_descriptor": compat["energy_contract"]["minimum_backend"] == product["minimum_backend"] and manifest["minimum_backend"] == product["minimum_backend"] and status["minimum_backend"] == product["minimum_backend"],
    "tested_backend_from_descriptor": compat["energy_contract"]["tested_backend_releases"] == [product["tested_backend"]],
    "stage_from_descriptor": manifest["stage"] == product["stage"] and status["stage"] == product["stage"],
    "artifact_from_descriptor": manifest["runtime_artifact"] == product["runtime_artifact"] and manifest["build_manifest"] == product["build_manifest"],
    "hacs_metadata_from_descriptor": manifest["hacs_repository_type"] == product["hacs_repository_type"] and manifest["hacs_validation_category"] == product["hacs_validation_category"],
    "rollback_from_descriptor": qualification["previous_release"] == product["rollback_release"].removeprefix("v"),
    "runtime_version_build_owned": "re.sub(" in build and "const UX_VERSION = 'R" in build and 'package["version"]' in build,
    "backend_version_single_owner": "backend_release: attrs.backend_release || 'unknown'" in source,
    "no_backend_version_fallback": "attrs.backend_version || attrs.backend_release" not in source and "attrs.release_version || this.releaseState()?.state" not in source,
    "release_notes_current": notes.startswith(f"# v{version} ") or notes.startswith(f"# RHI Energy UX v{version} "),
    "changelog_current": any(line.startswith(f"## {version} ") for line in changelog.splitlines()[:8]),
    "test_ownership_principle": ownership.get("principle") == "one invariant, one test owner" and "One invariant has exactly one test owner" in test_governance,
    "owned_suite_scripts": all(name in pkg.get("scripts", {}) for name in ("test:contract","test:ux","test:package","test:release","check:test-ownership","release:sync")),
    "validate_pr_only": "pull_request:" in validate and "push:\n    branches: [main]" not in validate,
    "validate_has_two_build_proof": "Deterministic two-build proof" in validate,
    "validate_has_immutable_runtime_gate": "Protect immutable published runtime" in validate,
    "publish_exact_artifact": "Publish exact TEST CANDIDATE artifact" in publish and "npm run build" not in publish and "npm run validate" not in publish and "npm ci" not in publish,
    "stable_no_rebuild": "npm run build" not in release and "npm run validate" not in release and "npm ci" not in release,
    "candidate_is_normal_release": "--prerelease" not in publish and "isPrerelease --jq '.isPrerelease'" in publish,
    "qualification_does_not_publish": "release/QUALIFICATION.json" not in publish.split("permissions:", 1)[0],
    "shared_exact_artifact_standard": "publish the exact committed artifact" in shared_release,
    "governance_no_rebuild": "publication does not rebuild" in governance,
    "hacs_resource_documented": "/hacsfiles/rhi-energy-ux/rhi-energy-ux.js" in readme,
    "dashboard_views_documented": "views:" in readme and "custom:homebrain-energy-card" in readme,
    "evergreen_docs": "R3.91.4" not in architecture and "R3.94.7" not in maintainability,
    "canonical_consumption_terms": "Home Base Load" not in drift,
    "source_authority_documented": "source/homebrain-energy-card.js" in maintainability and "not a second runtime publication path" in maintainability,
    "zero_accepted_debt": manifest.get("known_accepted_technical_debt") == 0 and manifest.get("known_accepted_feature_debt") == 0,
}

workflow_text = "\n".join(read(f".github/workflows/{name}") for name in ("validate.yml","publish-hacs.yml","release.yml"))
checks["actions_pinned"] = (
    "actions/checkout@fbc6f3992d24b796d5a048ff273f7fcc4a7b6c09" in workflow_text
    and "actions/setup-node@a0853c24544627f65ddf259abe73b1d18a591444" in workflow_text
    and "actions/setup-python@ece7cb06caefa5fff74198d8649806c4678c61a1" in workflow_text
)

workflows = sorted(p.name for p in (ROOT / ".github/workflows").glob("*.yml"))
checks["exact_three_workflows"] = workflows == ["publish-hacs.yml","release.yml","validate.yml"]

failed = [name for name, ok in checks.items() if not ok]
for name, ok in checks.items():
    print(("PASS" if ok else "FAIL"), name)
if failed:
    raise SystemExit("release governance validation failed: " + ", ".join(failed))
