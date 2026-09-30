from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]

def load(rel):
    return json.loads((ROOT / rel).read_text(encoding="utf-8"))

product = load("release/product.json")
pkg = load("package.json")
lock = load("package-lock.json")
compat = load("COMPATIBILITY.json")
manifest = load("RELEASE_MANIFEST.json")
status = load("release/RELEASE_STATUS.json")
qualification = load("release/QUALIFICATION.json")
release_notes = (ROOT / "release/RELEASE_NOTES.md").read_text(encoding="utf-8")
changelog = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8")

version = str(product["version"])
expected = {
    "package.json.version": pkg.get("version") == version,
    "package-lock.version": lock.get("version") == version and lock.get("packages",{}).get("",{}).get("version") == version,
    "compatibility.version": compat.get("ux_version") == version,
    "compatibility.contract": compat.get("energy_contract",{}).get("minimum") == product["contract"],
    "compatibility.minimum_backend": compat.get("energy_contract",{}).get("minimum_backend") == product["minimum_backend"],
    "compatibility.tested_backend": compat.get("energy_contract",{}).get("tested_backend_releases") == [product["tested_backend"]],
    "manifest.version": manifest.get("version") == version,
    "manifest.contract": manifest.get("energy_contract") == product["contract"],
    "manifest.minimum_backend": manifest.get("minimum_backend") == product["minimum_backend"],
    "manifest.tested_backend": manifest.get("tested_backend_baseline") == product["tested_backend"],
    "manifest.stage": manifest.get("stage") == product["stage"],
    "status.version": status.get("source_candidate_version") == version,
    "status.contract": status.get("contract") == product["contract"],
    "status.minimum_backend": status.get("minimum_backend") == product["minimum_backend"],
    "ux_core.compatibility": compat.get("ux_core",{}).get("version") == product.get("ux_core",{}).get("version") and compat.get("ux_core",{}).get("runtime_dependency") is False,
    "ux_core.manifest": manifest.get("ux_core",{}).get("source_commit") == product.get("ux_core",{}).get("source_commit") and manifest.get("ux_core",{}).get("runtime_dependency") is False,
    "ux_core.status": status.get("ux_core",{}).get("version") == product.get("ux_core",{}).get("version") and status.get("ux_core",{}).get("runtime_dependency") is False,
    "foundation.compatibility": compat.get("foundation",{}).get("minimum_release") == product.get("minimum_foundation") and compat.get("foundation",{}).get("visual_registry_contract") == "RHI_VISUAL_ASSET_REGISTRY_V1" and compat.get("foundation",{}).get("minimum_contract_version") == "1.1.0",
    "foundation.manifest": manifest.get("minimum_foundation") == product.get("minimum_foundation"),
    "foundation.status": status.get("minimum_foundation") == product.get("minimum_foundation"),
    "mobility_visual_dependency.compatibility": compat.get("mobility",{}).get("minimum_release_for_cross_domain_visuals") == product.get("minimum_mobility_for_cross_domain_visuals"),
    "mobility_visual_dependency.manifest": manifest.get("minimum_mobility_for_cross_domain_visuals") == product.get("minimum_mobility_for_cross_domain_visuals"),
    "mobility_visual_dependency.status": status.get("minimum_mobility_for_cross_domain_visuals") == product.get("minimum_mobility_for_cross_domain_visuals"),
    "qualification.version": qualification.get("version") == version,
    "qualification.tag": qualification.get("candidate_tag") == f"v{version}",
    "qualification.rollback": qualification.get("previous_release") == product["rollback_release"].removeprefix("v"),
    "qualification.sha": qualification.get("candidate_sha") == "pending" or bool(re.fullmatch(r"[0-9a-fA-F]{40}", str(qualification.get("candidate_sha","")))),
    "release_notes_current": version in release_notes.splitlines()[0],
    "changelog_current": next((line.split()[1] for line in changelog.splitlines() if line.startswith("## ")), "") == version,
    "zero_accepted_debt": manifest.get("known_accepted_technical_debt") == 0 and manifest.get("known_accepted_feature_debt") == 0,
}
failed=[name for name, ok in expected.items() if not ok]
for name, ok in expected.items():
    print(("PASS" if ok else "FAIL"), name)
if failed:
    raise SystemExit("release projection drift; run npm run release:sync: " + ", ".join(failed))
print("PASS release governance: release/product.json is the single release identity owner")
