#!/usr/bin/env python3
from pathlib import Path
import sys

root=Path(__file__).resolve().parents[1]
source=(root/'dist/rhi-energy-ux.js').read_text(encoding='utf-8')
flow_block=source[source.find('canonicalConnectionSnapshot'):source.find('flow(rt)', source.find('canonicalConnectionSnapshot'))]
checks={
 'single_v2_connection_authority': "publicV2: 'sensor.rhi_energy_public_contract_v2'" in source and 'sensor.energy_connection_property_index' not in source,
 'connection_detail_fails_closed': 'Canonical physical connection telemetry is not published by E0.15.47.' in flow_block and 'rows:Object.freeze([])' in flow_block,
 'canonical_interface_public_visibility': 'isCanonicalUxInterface(entityId)' in source and "visibility === 'ux_safe'" in source,
 'no_connection_inventory_fallback': 'const connectionIds = new Set()' not in flow_block,
 'strict_zero_null_connection': "const powerText = power === null ? '—' : fmtKw(power);" in source,
 'consumer_card_local_power': source[source.find('consumerCard(rt, consumer)'):source.find('flowConsumers(rt)', source.find('consumerCard(rt, consumer)'))].count('const powerText =') == 1,
 'flow_detail_card_style': '.flowConnectionCard,.flowPhysicalConsumerCard{display:grid' in source,
 'no_connection_specific_product_owner': 'UX_INTERFACES.connection' not in source,
}
failed=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(('PASS' if v else 'FAIL'),k)
if failed: sys.exit(1)
