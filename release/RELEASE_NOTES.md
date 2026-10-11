# v4.3.36-rc.11 — Power Flow Card Plus measured site demand safety (HACS TEST CANDIDATE)

- Power Flow Card Plus has an implicit Home calculation by default. RHI now explicitly requires a unique AVAILABLE canonical site consumption power sensor and sets home.override_state=true to prevent derived or invented demand.
- If site consumption is not published, the existing warning states that the measured flow cannot safely be rendered. No consumer power, charger power or battery power is added to fake a balance.
- Preserve rc.10 real external card integration, full flexible load inventory, charger relationship list, all existing heroes and historical graphs.
- Validate plugin configuration, measured Home override, missing/ambiguous canonical sensors and zero.

Target HA/iPad functional and rollback validation remains pending. HACS TEST CANDIDATE, not stable. Rollback: v4.3.36-rc.10.
