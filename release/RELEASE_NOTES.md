# v4.3.36-rc.1 — experimental Energy HACS native-planning candidate

This is an **installable test prerelease, not stable or target-HA qualified**. It targets the selectable EMHASS / deterministic Energy backend E0.15.112. HACS beta versions must be enabled.

- Native D0/D1 total metrics preserve zero, reject malformed data and fail closed for unsupported horizons.
- A provider-neutral canonical horizon reader consumes buckets, planning assets, lane/balance evidence, plan identity and execution policy only when the backend publishes the optional RHI_ENERGY_PLANNING_HORIZON_V1 contract.
- Backend publication of full horizon details is proposed separately in Energy backend PR #249 and is **not included in E0.15.112**. Until deployed, the UX marks missing planning-detail capabilities explicitly.
- Public V2 compatibility consumers remain in this candidate; canonical-only cutover, full configuration UX, live Home Assistant acceptance and rollback proof are open P0 gates. This candidate makes no stable-qualification claim.

Rollback: **v4.3.35**. No GitHub release assets; HACS installs the immutable tag `dist/` tree.
