# v4.3.36-rc.1 — experimental Energy HACS native-planning candidate

This is an **installable test prerelease, not stable or target-HA qualified**. It targets the selectable EMHASS / deterministic Energy backend E0.15.112. HACS beta versions must be enabled.

- Native D0/D1 total metrics preserve zero, reject malformed data and fail closed for unsupported horizons.
- A provider-neutral canonical horizon reader consumes buckets, planning assets, lane/balance evidence, plan identity and execution policy only when the backend publishes the optional RHI_ENERGY_PLANNING_HORIZON_V1 contract.
- Backend publication of full horizon details is proposed separately in Energy backend PR #249 and is **not included in E0.15.112**. Until deployed, the UX marks missing planning-detail capabilities explicitly.
- Public V2 compatibility consumers remain in this candidate; canonical-only cutover, full configuration UX, live Home Assistant acceptance and rollback proof are open P0 gates. This candidate makes no stable-qualification claim.

Rollback: **v4.3.35**. No GitHub release assets; HACS installs the immutable tag `dist/` tree.

## Native backend interface cutover — engineering candidate (2026-10-11)
- Canonical object status and property entities own Energy identity, parent/child hierarchy, presentation and real-time values; physical units are no longer reconstructed from aggregate Public V2 snapshots.
- Energy backend engineering branch publishes complete metadata on native strategy/pricing/metering editors and command button invocation contracts. Backend ownership of allowed services and value readback is preserved.
- D0/D1 planning totals use twelve native numeric metrics with explicit zero, missing-data and duplicate-publisher guards. Horizon buckets, planning assets, provider and execution policy depend on the unreleased native planning-horizon sensor now copied to the backend engineering branch.
- Current Home Consumption accepts exact canonical property evidence or the dedicated native metric only when the property is not published; unavailable or ambiguous property evidence never falls back.
- Net financial result is selected by its explicitly published period and actual-completeness; no fabricated kWh, VAT, savings, asset allocation or combined totals.
- Native command rows are bound to exact supported/executable backend invoke targets, with collision and missing-service guards.
- Canonical object identity refreshes are tracked independently from property revision; native planning, command and financial changes invalidate the view.
- This is an **unreleased candidate**. Full legacy smoke-suite adaptation, CI and real Home Assistant acceptance must pass before HACS promotion.
