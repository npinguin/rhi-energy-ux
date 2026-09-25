#!/usr/bin/env python3
from pathlib import Path
import sys

root=Path(__file__).resolve().parents[1]
s=(root/'dist/rhi-energy-ux.js').read_text(encoding='utf-8')
consumer=s[s.find('consumerCard(rt, consumer)'):s.find('flowConsumers(rt)')]

checks={
  'single_v2_product_owner': "publicV2: 'sensor.rhi_energy_public_contract_v2'" in s,
  'no_v1_metering_owner': 'sensor.energy_asset_metering_index' not in s,
  'no_v1_connection_owner': 'sensor.energy_connection_property_index' not in s,
  'consumer_power_text_once': consumer.count("const powerText = power === null ? '—' : fmtKw(power);") == 1,
  'consumer_uses_power_text': '<strong>${escapeHtml(powerText)}</strong>' in consumer,
  'metering_selector_exists': 'function selectEnergyMetering' in s,
  'metering_fails_closed': 'canonical_period_energy_not_published' in s,
  'commands_use_backend_visibility': 'row.visible' in s and 'row.enabled' in s,
}
failed=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(('PASS' if v else 'FAIL'),k)
if failed: sys.exit(1)
