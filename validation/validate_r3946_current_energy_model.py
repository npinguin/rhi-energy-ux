from pathlib import Path

source = Path('source/homebrain-energy-card.js').read_text(encoding='utf-8')
module = Path('source/modules/runtime/current-energy-view-model.js').read_text(encoding='utf-8')
class_source = source[source.index('class HomeBrainEnergyCard'):]
checks = {
    'release_identity': "const UX_VERSION = 'R3.94.8'" in source,
    'canonical_module_present': 'function createCurrentEnergyViewModel(gateway)' in module,
    'battery_model_present': 'function createBatteryCurrentFlowViewModel(gateway)' in module,
    'screen_helper_present': 'currentEnergyModel(rt) { return createCurrentEnergyViewModel(rt.contractGateway()); }' in source,
    'no_aggregate_battery_contract_reads_in_renderers': all(token not in class_source for token in [
        "rt.number('battery.power_kw')",
        "rt.number('battery.charge_power_kw')",
        "rt.number('battery.discharge_power_kw')",
        "rt.value('battery.state'"
    ]),
    'no_local_battery_direction_thresholds': '(batteryCharge || 0) > 0.05' not in class_source and '(batteryDischarge || 0) > 0.05' not in class_source,
    'flow_uses_canonical_battery_model': "fmtKw(battery.displayPowerKw,'—')" in source and "fmtKw(battery.signedFlowKw,'—')" in source,
    'overview_uses_canonical_battery_model': "balanceVm.battery.direction === 'out_of_storage'" in source and "balanceVm.battery.direction === 'into_storage'" in source,
    'battery_page_uses_canonical_battery_model': 'const batteryVm = this.currentEnergyModel(rt).battery;' in source,
}
failed = [name for name, ok in checks.items() if not ok]
for name, ok in checks.items():
    print(f"{'PASS' if ok else 'FAIL'} {name}")
if failed:
    raise SystemExit('R3.94.8 current-energy validation failed: ' + ', '.join(failed))
