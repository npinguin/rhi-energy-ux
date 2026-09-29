from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "governance" / "energy-visual-manifest.json"
CATALOG = ROOT / "src" / "app" / "energy-asset-catalog.js"
SRC_ASSETS = ROOT / "src" / "assets"
DIST_ASSETS = ROOT / "dist" / "assets"

data = json.loads(MANIFEST.read_text(encoding="utf-8"))
if data.get("schema_version") != 2:
    raise SystemExit("energy visual manifest schema drifted")
if data.get("migration_complete") is not False:
    raise SystemExit("visual migration must remain incomplete until final package QA is closed")

policy = data.get("policy") or {}
if policy.get("dashboard_heroes_out_of_scope") is not True:
    raise SystemExit("dashboard heroes must remain outside the physical asset catalog")
if policy.get("hero_as_asset_fallback_forbidden") is not True:
    raise SystemExit("hero-as-asset fallback must be forbidden")
if policy.get("cross_concept_fallback_forbidden") is not True:
    raise SystemExit("cross-concept fallback must be forbidden")

expected = {
    "battery_system",
    "battery",
    "solar_zone",
    "solar_panel",
    "solar_inverter",
    "solar_optimizer",
    "backup_interface",
    "gas_meter",
    "grid_meter",
}
manifest_types = set(data.get("supported_asset_types") or [])
if manifest_types != expected:
    raise SystemExit(f"Energy physical visual type inventory drifted: {sorted(manifest_types ^ expected)}")

coverage = data.get("concept_coverage") or []
coverage_types = [str(row.get("asset_type") or "") for row in coverage]
if set(coverage_types) != expected or len(coverage_types) != len(expected):
    raise SystemExit("physical concept coverage must contain exactly one row per supported type")

targets = data.get("product_search_targets") or []
if not targets:
    raise SystemExit("product_search_targets must not be empty")

seen_identity = set()
for row in targets:
    if row.get("asset_type") not in expected:
        raise SystemExit(f"product target uses non-physical type: {row.get('asset_type')}")
    forbidden = {
        "deployment_context", "customer", "customer_name", "project", "project_name",
        "site", "site_name", "address", "serial_number", "installation_count",
    }
    leaked = forbidden.intersection(row.keys())
    if leaked:
        raise SystemExit(f"customer/project context leaked into reusable manifest: {sorted(leaked)}")
    for key in ("brand", "model", "package_path", "artwork_status"):
        if not str(row.get(key) or "").strip():
            raise SystemExit(f"product target missing {key}: {row}")
    if row["artwork_status"] != "published_approved":
        raise SystemExit(f"published product target has non-final artwork status: {row}")
    identity = (
        str(row.get("asset_type") or "").strip().lower(),
        str(row.get("brand") or "").strip().lower(),
        str(row.get("model") or "").strip().lower(),
        str(row.get("variant") or "").strip().lower(),
        str(row.get("sku") or "").strip().lower(),
    )
    if identity in seen_identity:
        raise SystemExit(f"duplicate reusable product identity: {identity}")
    seen_identity.add(identity)
    rel = str(row["package_path"])
    if rel.startswith("heroes/"):
        raise SystemExit(f"hero artwork used as physical asset: {rel}")
    if not (SRC_ASSETS / rel).is_file():
        raise SystemExit(f"published product asset missing from source package: {rel}")
    if not (DIST_ASSETS / rel).is_file():
        raise SystemExit(f"published product asset missing from dist package: {rel}")
    if (SRC_ASSETS / rel).read_bytes() != (DIST_ASSETS / rel).read_bytes():
        raise SystemExit(f"src/dist bytes differ for physical asset: {rel}")

for row in data.get("generic_assets") or []:
    if row.get("asset_type") not in expected:
        raise SystemExit(f"generic asset uses non-physical type: {row}")
    rel = str(row.get("package_path") or row.get("target_package_path") or "")
    if not rel:
        raise SystemExit(f"generic asset missing path: {row}")
    if rel.startswith("heroes/"):
        raise SystemExit(f"hero artwork used as generic physical asset: {rel}")
    if row.get("artwork_status") == "published_approved":
        if not (SRC_ASSETS / rel).is_file() or not (DIST_ASSETS / rel).is_file():
            raise SystemExit(f"published generic asset missing: {rel}")
        if (SRC_ASSETS / rel).read_bytes() != (DIST_ASSETS / rel).read_bytes():
            raise SystemExit(f"src/dist bytes differ for generic asset: {rel}")

catalog = CATALOG.read_text(encoding="utf-8")
catalog_types = set(re.findall(r'asset_type:"([a-z0-9_]+)"', catalog))
if catalog_types != expected:
    raise SystemExit(f"runtime catalog and physical manifest type sets differ: {sorted(catalog_types ^ expected)}")
if "heroes/" in catalog:
    raise SystemExit("dashboard hero path leaked into physical asset catalog")

catalog_paths = set(re.findall(r'package_path:"([^"]+)"', catalog))
for rel in sorted(catalog_paths):
    if not (SRC_ASSETS / rel).is_file():
        raise SystemExit(f"runtime catalog references missing source asset: {rel}")
    if not (DIST_ASSETS / rel).is_file():
        raise SystemExit(f"runtime catalog references missing dist asset: {rel}")
    if (SRC_ASSETS / rel).read_bytes() != (DIST_ASSETS / rel).read_bytes():
        raise SystemExit(f"runtime catalog asset differs between src/dist: {rel}")

print(
    f"PASS Energy physical visual manifest: {len(expected)} physical concepts, "
    f"{len(targets)} product assets, no hero/cross-concept fallback"
)
