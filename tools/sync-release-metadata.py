from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]

def read(rel):
    return json.loads((ROOT / rel).read_text(encoding="utf-8"))

def write(rel, value):
    (ROOT / rel).write_text(json.dumps(value, indent=2) + "\n", encoding="utf-8")

pkg = read("package.json")
product = read("release/product.json")
version = str(pkg["version"])
tag = f"v{version}"

compat = read("COMPATIBILITY.json")
compat["ux_version"] = version
compat.setdefault("energy_contract", {})["minimum"] = product["contract"]
compat["energy_contract"]["minimum_backend"] = product["minimum_backend"]
compat["energy_contract"]["tested_backend_releases"] = [product["tested_backend"]]
write("COMPATIBILITY.json", compat)

manifest = read("RELEASE_MANIFEST.json")
manifest["product"] = product["product"]
manifest["version"] = version
manifest["stage"] = product["stage"]
manifest["energy_contract"] = product["contract"]
manifest["minimum_backend"] = product["minimum_backend"]
manifest["runtime_artifact"] = product["runtime_artifact"]
manifest["runtime_checksum_artifact"] = product["runtime_checksum_artifact"]
manifest.pop("build_manifest", None)
manifest["package_manifest"] = product["package_manifest"]
manifest["hacs_package_root"] = product["hacs_package_root"]
manifest["hacs_delivery_mode"] = product["hacs_delivery_mode"]
manifest["release_asset_policy"] = product["release_asset_policy"]
manifest["hacs_repository_type"] = product["hacs_repository_type"]
manifest["hacs_validation_category"] = product["hacs_validation_category"]
write("RELEASE_MANIFEST.json", manifest)

status = read("release/RELEASE_STATUS.json")
status["product"] = product["product"]
status["source_candidate_version"] = version
status["stage"] = product["stage"]
status["contract"] = product["contract"]
status["minimum_backend"] = product["minimum_backend"]
write("release/RELEASE_STATUS.json", status)

qualification = read("release/QUALIFICATION.json")
version_changed = qualification.get("version") != version
qualification["version"] = version
qualification["candidate_tag"] = tag
qualification.setdefault("candidate_sha", "pending")
qualification["previous_release"] = product["rollback_release"].removeprefix("v")
if version_changed:
    qualification["candidate_sha"] = "pending"
    for key in list(qualification):
        if key in {"version","candidate_tag","candidate_sha","previous_release","known_accepted_technical_debt","known_accepted_feature_debt"}:
            continue
        if key in {"runtime_proof","rollback_proof"}:
            qualification[key] = "PENDING"
        elif key == "release_decision":
            qualification[key] = "BLOCKED"
        else:
            qualification[key] = "NOT_EXECUTED"
write("release/QUALIFICATION.json", qualification)

print(f"Synchronized Energy release metadata for {tag}")
