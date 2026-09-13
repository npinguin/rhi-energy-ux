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
