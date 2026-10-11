# v4.3.36-rc.12 — Measured individual flexible-load flows (HACS TEST CANDIDATE)

- Add individual measured flexible-load power sensors to the installed Power Flow Card Plus. Every row must have an unambiguous, available RHI canonical flexible_load.power_kw entity with a compatible W/kW unit.
- Keep all flexible loads in the visible Flow inventory regardless of live sensor availability.
- Exclude charger infrastructure and repeated sensor entity IDs from the individual flow, preventing duplicated charging electricity. Charger-to-vehicle connections remain in their own relationship list.
- Do not synthesize missing home consumption, battery directions or EV charging power. If the required canonical site consumption source is missing, show the explicit unavailable state.
- Keep every current hero, chart, brand asset and Energy tab unchanged.

This HACS candidate has not been runtime-verified on the target HA installation. Rollback: v4.3.36-rc.11.
