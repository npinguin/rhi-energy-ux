#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

required = [
    ROOT / "src/runtime/energy-contract-gateway.js",
    ROOT / "src/runtime/energy-v2-contract.js",
    ROOT / "src/domain/selectors/energy-selectors.js",
    ROOT / "src/domain/models/current-energy-view-model.js",
    ROOT / "src/domain/planning/planning-contract.js",
    ROOT / "src/domain/planning/planning-view-model.js",
]
missing = [str(path.relative_to(ROOT)) for path in required if not path.is_file()]
if missing:
    raise SystemExit("missing architecture owners: " + ", ".join(missing))

card = (ROOT / "src/app/energy-card.js").read_text(encoding="utf-8")
screen_start = card.find("class HomeBrainEnergyCard")
screen_source = card[screen_start:] if screen_start >= 0 else card

failures = []

# Renderers consume EnergyRuntime/projections, never the raw V2 adapter.
for token in ("this.publicV2()", "readEnergyPublicV2("):
    if token in screen_source:
        failures.append(f"renderer_raw_contract_bypass:{token}")

# Product source must never regain legacy V1 product authority.
legacy_product_tokens = [
    "sensor.energy_asset_index",
    "sensor.energy_relationship_index",
    "sensor.energy_command_index",
    "sensor.energy_activity_index",
    "sensor.energy_overview_experience",
    "sensor.energy_planning_index",
    "sensor.energy_battery_property_index",
    "sensor.energy_grid_property_index",
    "sensor.energy_consumption_property_index",
    "sensor.energy_pricing_property_index",
    "sensor.energy_strategy_profile_index",
    "sensor.energy_strategy_effective_index",
    "sensor.energy_value_accounting_index",
    "script.energy_write_public_property",
    "script.energy_execute_public_command",
]
for full in (ROOT / "src").rglob("*"):
    if not full.is_file() or full.suffix not in {".js", ".json"}:
        continue
    source = full.read_text(encoding="utf-8")
    for token in legacy_product_tokens:
        if re.search(re.escape(token) + r"(?!_health)", source):
            failures.append(f"legacy_product_authority:{full.relative_to(ROOT)}:{token}")

# Home Assistant entity-state access belongs to runtime/app transport, not domain models/selectors.
for rel in [
    "src/domain/selectors/energy-selectors.js",
    "src/domain/models/current-energy-view-model.js",
    "src/domain/planning/planning-contract.js",
    "src/domain/planning/planning-view-model.js",
]:
    source = (ROOT / rel).read_text(encoding="utf-8")
    if re.search(r"\bhass\.states\b|\bthis\.hass\.states\b", source):
        failures.append(f"domain_direct_ha_access:{rel}")

# Optional transport metadata may never become a second product-availability gate.
if "contract_visibility" in card:
    failures.append("optional_contract_visibility_must_not_gate_public_v2")

# The public registry has exactly one Energy product entrypoint.
registry = (ROOT / "src/runtime/public-interface-registry.js").read_text(encoding="utf-8")
if "publicV2: 'sensor.rhi_energy_public_contract_v2'" not in registry:
    failures.append("canonical_public_v2_entrypoint_missing")
for legacy_key in ("assets:", "relationships:", "commands:", "planning:", "metering:", "value:", "editableProperties:"):
    if legacy_key in registry:
        failures.append(f"parallel_product_registry_owner:{legacy_key}")

if failures:
    for failure in failures:
        print("FAIL", failure)
    raise SystemExit(1)

print("PASS Energy architecture boundary: Public V2 -> runtime/projections -> renderers; no legacy authority")
