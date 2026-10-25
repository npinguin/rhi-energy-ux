# v4.3.36-rc.23 — User-requested Energy UX HACS runtime TEST (24 October 2026)

**TEST only, STABLE NO-GO.** Explicit five-package authorization: https://github.com/npinguin/rhi-foundation/issues/129#issuecomment-6385576869. Code-wise 3/12 source themes accepted, 9/12 incomplete; 0/12 physical runtime acceptance.

## New since immutable rc.22

- [Energy UX #266](https://github.com/npinguin/rhi-energy-ux/pull/266): actual producer-owned D2 advisory planning, correct per-participant Need/Planned/Still-to-plan, no D0/D1 scalar reuse, unknown rather than invented 0, EN/NL/FR, release and HACS package fidelity.
- Preserve native measured Flow, price and strategy editor readback, signed/unknown EUR and always-on backend/package version from current Energy source authority. UX cannot authorize commands or synthesize financial/horizon data.

**Five-tag TEST:** Foundation F1.8.48, Mobility M0.10.54, Energy E0.15.141, Mobility UX v1.0.0-rc.101, Energy UX v4.3.36-rc.23. Validate live Wessels, Molas/Huawei and independent Sonnen/SMA HA producer/consumer parity, D0/D1/D2, price settings/strategy edits, mobile/tablet/desktop, EN/NL/FR, source outages/recovery/restart, and five-package rollback. Missing physical readback or contradicted source quality is a test failure, not evidence of completion.

Exact HACS plugin uses immutable tag `dist/` and no release attached asset; STABLE production approval requires later separate authorization.
