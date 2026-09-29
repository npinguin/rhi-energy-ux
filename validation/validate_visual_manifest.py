from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "governance" / "energy-visual-manifest.json"
CATALOG = ROOT / "src" / "app" / "energy-asset-catalog.js"
SRC_ASSETS = ROOT / "src" / "assets"

data = json.loads(MANIFEST.read_text(encoding="utf-8"))
if data.get("schema_version") != 1:
    raise SystemExit("energy visual manifest schema drifted")
if data.get("migration_complete") is not False:
    raise SystemExit("visual migration must remain incomplete until all fallback/product QA is closed")

expected = {
    "battery_system","battery","grid_connection","grid_phase","solar_production","solar_panel",
    "solar_inverter","solar_inverter_phase","solar_optimizer","backup_interface","solar_forecast",
    "gas_meter","price_source","home_consumption","flexible_load","flexible_asset","consumer",
    "solar_array","inverter","site_consumption","energy_system"
}
manifest_types = set(data.get("supported_asset_types") or [])
if manifest_types != expected:
    raise SystemExit(f"Energy visual asset-type inventory drifted: {sorted(manifest_types ^ expected)}")

coverage = data.get("concept_coverage") or []
coverage_types = [row.get("asset_type") for row in coverage]
if set(coverage_types) != expected or len(coverage_types) != len(expected):
    raise SystemExit("Energy visual concept coverage must contain exactly one row for every supported type")

for row in coverage:
    current = str(row.get("current_fallback") or "")
    if current and not (SRC_ASSETS / current).is_file():
        raise SystemExit(f"manifest references missing current fallback: {current}")
    if current.startswith("heroes/") and row.get("decision") != "replace":
        raise SystemExit(f"hero-as-fallback debt must be explicitly marked replace: {row.get('asset_type')}")

targets = data.get("product_search_targets") or []
if not targets:
    raise SystemExit("product_search_targets must not be empty")

identities = set()
paths = set()
for row in targets:
    forbidden = {"deployment_context","customer","customer_name","project","project_name","site","site_name","address"}
    leaked = forbidden.intersection(row.keys())
    if leaked:
        raise SystemExit(f"customer/project context leaked into reusable manifest: {sorted(leaked)}")
    for key in ("brand","model","search_key_primary","decision"):
        if not str(row.get(key) or "").strip():
            raise SystemExit(f"product target missing {key}: {row}")

    identity = (
        str(row.get("brand") or "").strip().lower(),
        str(row.get("model") or "").strip().lower(),
        str(row.get("variant") or "").strip().lower(),
        str(row.get("sku") or "").strip().lower(),
    )
    if identity in identities:
        raise SystemExit(f"duplicate reusable product identity: {identity}")
    identities.add(identity)

    package_path = str(row.get("package_path") or "").strip()
    target_path = str(row.get("target_package_path") or "").strip()
    if not package_path and not target_path:
        raise SystemExit(f"product target has neither package_path nor target_package_path: {identity}")

    if package_path:
        if package_path in paths:
            raise SystemExit(f"duplicate package path: {package_path}")
        paths.add(package_path)
        if not (SRC_ASSETS / package_path).is_file():
            raise SystemExit(f"published package_path is missing: {package_path}")

    if target_path and row.get("artwork_status") == "published_approved":
        raise SystemExit(f"published artwork must use package_path, not target_package_path: {identity}")

catalog = CATALOG.read_text(encoding="utf-8")
catalog_types = set(re.findall(r'asset_type:"([a-z0-9_]+)"', catalog))
if catalog_types != expected:
    raise SystemExit(f"runtime catalog and visual manifest type sets differ: {sorted(catalog_types ^ expected)}")

print(f"PASS Energy visual manifest: {len(expected)} concepts, {len(targets)} product targets; no hard-coded target count")
