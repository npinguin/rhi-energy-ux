#!/usr/bin/env python3
from pathlib import Path
import sys
root = Path(__file__).resolve().parents[1]
main = (root/'dist/rhi-energy-ux.js').read_text(encoding='utf-8')
required = [
    root/'src/runtime/energy-contract-gateway.js',
    root/'src/runtime/energy-v2-contract.js',
    root/'src/domain/planning/planning-contract.js',
    root/'src/domain/planning/planning-view-model.js',
]
failures=[]
for path in required:
    if not path.is_file(): failures.append(f'missing:{path.relative_to(root)}')
planning_start=main.find('    planning(rt) {')
planning_end=main.find('    placeholder(rt) {', planning_start)
renderer=main[planning_start:planning_end]
for forbidden in ('planning_horizons_by_id','planning_lane_totals_json','planning_horizon_totals_json','summary.lane_totals'):
    if forbidden in renderer: failures.append(f'planning_renderer_raw_path:{forbidden}')
if "createPlanningViewModel({ gateway: rt.contractGateway()" not in main:
    failures.append('planning_not_using_gateway_view_model')
if failures:
    print('FAIL', ','.join(failures)); sys.exit(1)
print('PASS contract gateway architecture')

# R3.90.5: Flexible Load cards consume normalized backend-owned actions.
source = (root / "dist" / "rhi-energy-ux.js").read_text(encoding="utf-8")
required_command_tokens = [
    "readEnergyCommandContract",
    "createCommandActionModel",
    "commandActionModelsForAsset",
    "const actionModels = rt.commandActionModelsForAsset(id)",
]
for token in required_command_tokens:
    if token not in source:
        raise SystemExit(f"Missing command architecture token: {token}")
for forbidden in [
    "this.commandButton(startCommand, 'Start now', id)",
    "this.commandButton(stopCommand, 'Stop', id)",
    "this.commandButton(holdCommand, holdLabel, id)",
]:
    if forbidden in source:
        raise SystemExit(f"Fixed Flexible Load command composition remains: {forbidden}")
print("PASS command contract architecture")


# R3.94.10: product runtime must resolve each meaning through one registry owner only.
if "publicUxEntities().includes('sensor.energy_" in main:
    failures.append("direct_public_entity_owner_selection")
if "return this.allRows().get(String(key))" in main:
    failures.append("cross_owner_row_fallback")
if "consumerFallbackRows(" in main or "publishedRows.length ? publishedRows" in main:
    failures.append("consumer_cross_owner_fallback")
if "const publishedOwner = String(asset?.property_index || '').trim();" not in main:
    failures.append("dynamic_asset_property_owner_missing")
if "battery_1: 'battery'" in main or "battery_2: 'battery'" in main:
    failures.append("hardcoded_battery_child_owner")

diagnostic_start = main.find("    diagnosticSpec(tab) {")
diagnostic_end = main.find("    diagnosticEntity(rt, entityId, label, purpose) {", diagnostic_start)
diagnostic_spec = main[diagnostic_start:diagnostic_end]
if "sensor.energy_" in diagnostic_spec:
    failures.append("diagnostic_spec_direct_entity_literal")
if "sensor.energy_metering_property_index" in main:
    failures.append("legacy_metering_owner_reference")

registry = (root/'src/runtime/public-interface-registry.js').read_text(encoding='utf-8')
if "metering: 'sensor.energy_asset_metering_index'" not in registry:
    failures.append("canonical_metering_owner_missing")
if "pilotReadiness: 'sensor.energy_pilot_readiness'" not in registry:
    failures.append("pilot_readiness_not_centralized")

if failures:
    print('FAIL', ','.join(failures)); sys.exit(1)
print('PASS public interface ownership')

# Canonical V2 closure: migrated product meanings may not regress to V1 owners.
source_card = (root/'src/app/energy-card.js').read_text(encoding='utf-8')
current_model = (root/'src/domain/models/current-energy-view-model.js').read_text(encoding='utf-8')
if "const entityId = this.interfaceEntity('assets')" in source_card:
    failures.append('assets_regressed_to_v1_asset_index')
if "const entityId = this.interfaceEntity('relationships')" in source_card:
    failures.append('relationships_regressed_to_v1_relationship_index')
if "gateway.contract(interfaceKey)" in current_model:
    failures.append('current_energy_model_regressed_to_v1_property_contracts')
if "readEnergyPublicV2(gateway)" not in current_model:
    failures.append('current_energy_model_missing_v2_authority')
if "readEnergyPublicV2(this.contractGateway())" not in source_card:
    failures.append('energy_runtime_missing_v2_projection_boundary')
if failures:
    print('FAIL', ','.join(failures)); sys.exit(1)
print('PASS canonical Energy V2 projection boundary')
