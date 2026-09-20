#!/usr/bin/env python3
from pathlib import Path
import sys
root = Path(__file__).resolve().parents[1]
main = (root/'source/homebrain-energy-card.js').read_text(encoding='utf-8')
required = [
    root/'source/modules/runtime/energy-contract-gateway.js',
    root/'source/modules/planning/planning-contract.js',
    root/'source/modules/planning/planning-view-model.js',
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
source = (root / "source" / "homebrain-energy-card.js").read_text(encoding="utf-8")
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

diagnostic_start = main.find("    diagnosticSpec(tab) {")
diagnostic_end = main.find("    diagnosticEntity(rt, entityId, label, purpose) {", diagnostic_start)
diagnostic_spec = main[diagnostic_start:diagnostic_end]
if "sensor.energy_" in diagnostic_spec:
    failures.append("diagnostic_spec_direct_entity_literal")
if "sensor.energy_metering_property_index" in main:
    failures.append("legacy_metering_owner_reference")

registry = (root/'source/modules/runtime/public-interface-registry.js').read_text(encoding='utf-8')
if "metering: 'sensor.energy_asset_metering_index'" not in registry:
    failures.append("canonical_metering_owner_missing")
if "pilotReadiness: 'sensor.energy_pilot_readiness'" not in registry:
    failures.append("pilot_readiness_not_centralized")

if failures:
    print('FAIL', ','.join(failures)); sys.exit(1)
print('PASS public interface ownership')
