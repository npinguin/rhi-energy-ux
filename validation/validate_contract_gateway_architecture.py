#!/usr/bin/env python3
from pathlib import Path
import sys
import re
root = Path(__file__).resolve().parents[1]
main = (root/'dist/rhi-energy-ux.js').read_text(encoding='utf-8')
required = [
    root/'src/runtime/energy-contract-gateway.js',
    root/'src/runtime/energy-v2-contract.js',
    root/'src/domain/planning/planning-contract.js',
    root/'src/domain/planning/planning-view-model.js',
]
failures=[]
source_card = (root/'src/app/energy-card.js').read_text(encoding='utf-8')
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
if "sensor.energy_" in source_card:
    # Product source code may keep diagnostic sensor names only in the diagnostics
    # allowlist at the top of energy-card.js; product ownership cannot depend on them.
    product_body = source_card[source_card.find("class EnergyRuntime"):]
    if "sensor.energy_" in product_body:
        failures.append("product_runtime_contains_legacy_energy_sensor_literal")

diagnostic_start = main.find("    diagnosticSpec(tab) {")
diagnostic_end = main.find("    diagnosticEntity(rt, entityId, label, purpose) {", diagnostic_start)
diagnostic_spec = main[diagnostic_start:diagnostic_end]
if "sensor.energy_" in diagnostic_spec:
    failures.append("diagnostic_spec_direct_entity_literal")
if "sensor.energy_metering_property_index" in main:
    failures.append("legacy_metering_owner_reference")

registry = (root/'src/runtime/public-interface-registry.js').read_text(encoding='utf-8')
if "publicV2: 'sensor.rhi_energy_public_contract_v2'" not in registry:
    failures.append("canonical_v2_entrypoint_missing")
for legacy_key in ("assets:", "relationships:", "commands:", "planning:", "metering:", "value:", "editableProperties:"):
    if legacy_key in registry:
        failures.append(f"legacy_product_registry_key:{legacy_key}")

if failures:
    print('FAIL', ','.join(failures)); sys.exit(1)
print('PASS public interface ownership: one Energy product entrypoint')

# Canonical V2 closure: migrated product meanings may not regress to V1 owners.
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

# V1 product decommissioning gate. Diagnostics may retain historical health names,
# but src product code may not depend on frozen Energy V1 product sensors or script aliases.
legacy_product_tokens = [
    'sensor.energy_asset_index',
    'sensor.energy_relationship_index',
    'sensor.energy_command_index',
    'sensor.energy_activity_index',
    'sensor.energy_overview_experience',
    'sensor.energy_planning_experience_index',
    'sensor.energy_outlook_property_index',
    'sensor.energy_solar_property_index',
    'sensor.energy_grid_property_index',
    'sensor.energy_battery_property_index',
    'sensor.energy_consumption_property_index',
    'sensor.energy_forecast_property_index',
    'sensor.energy_pricing_property_index',
    'sensor.energy_asset_metering_index',
    'sensor.energy_consumer_property_index',
    'sensor.energy_consumer_mix_index',
    'sensor.energy_connection_property_index',
    'sensor.energy_flexible_asset_index',
    'sensor.energy_strategy_profile_index',
    'sensor.energy_strategy_effective_index',
    'sensor.energy_planning_index',
    'sensor.energy_intelligence_property_index',
    'sensor.energy_retrospective_event_index',
    'sensor.energy_value_accounting_index',
    'sensor.energy_public_editable_property_index',
    'script.energy_write_public_property',
    'script.energy_execute_public_command',
]
legacy_hits = []
for full in (root/'src').rglob('*'):
    if not full.is_file() or full.suffix not in {'.js','.json'}:
        continue
    source = full.read_text(encoding='utf-8')
    for token in legacy_product_tokens:
        if re.search(re.escape(token) + r'(?!_health)', source):
            legacy_hits.append(f'{full.relative_to(root)}:{token}')
if legacy_hits:
    print('FAIL legacy Energy V1 product dependency remains:', ','.join(legacy_hits))
    sys.exit(1)
print('PASS Energy UX product runtime is V2-only; legacy V1 product refs = 0')

# Screens may consume EnergyRuntime/typed selectors only; raw V2 contract shape stays
# inside the adapter/runtime boundary.
selectors = (root/'src/domain/selectors/energy-selectors.js').read_text(encoding='utf-8')
for selector in (
    'selectEnergyOverview','selectEnergyAsset','selectEnergyPlanning',
    'selectEnergyStrategies','selectEnergyPricing','selectEnergyValue',
    'selectEnergyMetering','selectEnergyActivity','selectEnergyCommands',
    'selectEnergyCoverage'
):
    if f'function {selector}' not in selectors:
        failures.append(f'missing_selector:{selector}')
if 'rt.publicV2()' in source_card:
    failures.append('screen_reads_raw_v2_contract')
if failures:
    print('FAIL', ','.join(failures)); sys.exit(1)
print('PASS Energy screens consume typed projection boundary')
