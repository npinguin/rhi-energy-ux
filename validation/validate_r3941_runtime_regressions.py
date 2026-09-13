#!/usr/bin/env python3
from pathlib import Path
import sys
root=Path(__file__).resolve().parents[1]
source=(root/'source/homebrain-energy-card.js').read_text(encoding='utf-8')
checks={
  'metering_screen_owner': "metering: 'sensor.energy_asset_metering_index'" in source and "metering: 'sensor.energy_metering_property_resolution_index'" not in source,
  'consumer_power_text_scoped': 'consumerCard(rt, consumer)' in source and 'flowPhysicalConsumerCard' in source and 'escapeHtml(powerText)' in source,
  'charger_power_text_scoped': source.count("const powerText = power === null ? '—' : fmtKw(power);") >= 2,
  'zero_null_semantics': "power === null ? '—' : fmtKw(power)" in source,
}
failed=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(('PASS' if v else 'FAIL'),k)
if failed: sys.exit(1)
