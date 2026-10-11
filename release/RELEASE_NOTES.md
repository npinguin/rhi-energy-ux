# v4.3.36-rc.2 — Energy structural recovery (UNPUBLISHED ENGINEERING BUILD)

**NO-GO / DO NOT PUBLISH.** The immutable `v4.3.36-rc.1` experimental candidate is not modified. This is a new engineering build, not an installable release candidate. A strict canonical-only audit still finds retired Public V2 dependencies; the current E0.15.114 producer does not provide that retired aggregate.

- Preserve canonical asset parentage, HA source linkage and identity metadata across runtime refresh.
- Home Consumption now reads producer-owned native `home_consumption_power_kw`; no inferred power balance.
- Native Energy D0/D1 planning totals and optional provider-owned horizon asset outcomes drive selected UX projections; missing planning details remain visibly unavailable.
- Financial value uses only the backend-selected period on native `net_financial_result_eur`; other periods are unknown, not zero.
- Show missing canonical product-truth warnings, do not declare pilot readiness without full product parity.
- Update contract, product vision and architecture documentation; strengthen negative regressions; regenerate bundle and checksum from the complete source manifest.

**Remaining blockers:** Public V2 reader/gateway and consumer paths; backend planning detail #249, Energy #240/#242, per-period metering and Strategy/Price/Command write/readback; full local source/UX/package tests and real target-HA upgrade/rollback. Minimum/tested backend version in the legacy descriptor is a **historical compatibility declaration, NOT evidence that this WIP build runs against E0.15.114**.

This engineering build has not passed full CI/HACS or target-HA qualification. No tag or GitHub Release should be created.
