#!/usr/bin/env python3
from pathlib import Path
import sys
root=Path(__file__).resolve().parents[1]
s=(root/"dist/rhi-energy-ux.js").read_text(encoding="utf-8")
consumer=s[s.find("consumerCard(rt, consumer)"):s.find("flowConsumers(rt)")]
checks={
  "metering_owner": "metering: 'sensor.energy_asset_metering_index'" in s,
  "connection_owner": "connection: 'sensor.energy_connection_property_index'" in s,
  "consumer_power_text_once": consumer.count("const powerText = power === null ? '—' : fmtKw(power);") == 1,
  "consumer_uses_power_text": "<strong>${escapeHtml(powerText)}</strong>" in consumer,
  "metering_detail_role": "['flexible_load_detail','flexible_loads','flexible_loads_unattributed'].includes(role)" in s,
  "metering_explicit_visibility": "row.ux_visible === true" in s,
  "no_internal_metering_owner": "metering: 'sensor.energy_metering_property_resolution_index'" not in s,
}
failed=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(("PASS" if v else "FAIL"),k)
if failed: sys.exit(1)
