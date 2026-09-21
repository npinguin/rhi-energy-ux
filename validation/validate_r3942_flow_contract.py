#!/usr/bin/env python3
from pathlib import Path
import sys
root=Path(__file__).resolve().parents[1]
source=(root/'dist/rhi-energy-ux.js').read_text(encoding="utf-8")
checks={
 'canonical_connection_owner': "connection: 'sensor.energy_connection_property_index'" in source,
 'connection_rows_only': 'parseMaybeJson(attrs.connections_json, null)' in source and 'row.ux_visible' in source,
 'canonical_interface_public_visibility': 'isCanonicalUxInterface(entityId)' in source and "visibility === 'ux_safe'" in source,
 'no_connection_inventory_fallback': 'const connectionIds = new Set()' not in source[source.find('canonicalConnectionSnapshot'):source.find('flow(rt)', source.find('canonicalConnectionSnapshot'))],
 'strict_zero_null_connection': "const powerText = power === null ? '—' : fmtKw(power);" in source,
 'consumer_card_local_power': source[source.find('consumerCard(rt, consumer)'):source.find('flowConsumers(rt)', source.find('consumerCard(rt, consumer)'))].count('const powerText =') == 1,
 'flow_detail_card_style': '.flowConnectionCard,.flowPhysicalConsumerCard{display:grid' in source,
 'flow_diagnostics_connection_owner': "[UX_INTERFACES.connection,'Charging connections'" in source,
}
failed=[k for k,v in checks.items() if not v]
for k,v in checks.items(): print(('PASS' if v else 'FAIL'),k)
if failed: sys.exit(1)
