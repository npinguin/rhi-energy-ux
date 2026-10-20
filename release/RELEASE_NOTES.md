# v4.3.36-rc.22 — Energy canonical identity and resilient Flow HACS TEST

**HACS TEST only — NOT stable approved.** [Explicit user request](https://github.com/npinguin/rhi-foundation/issues/129#issuecomment-6301892188).

## Fixes since v4.3.36-rc.21
- **Energy UX #262:** [Fix false `Backend Unknown` and contract warning](https://github.com/npinguin/rhi-energy-ux/pull/262) caused by expecting the optional, disabled Energy diagnostic release sensor. The UX now obtains backend identity from canonical property attributes and detects inconsistent publisher release versions instead of silently trusting an arbitrary entity.
- **Energy UX #262:** [Render Flow with measured fallback](https://github.com/npinguin/rhi-energy-ux/pull/262) when the detail renderer throws; log the exception and preserve producer-owned measurements rather than blanking the whole page. The original browser exception requires additional HA runtime observation and the interactive Flow is not yet acceptance-qualified.
- **Energy backend #378:** [Publish `publisher_release` on canonical properties](https://github.com/npinguin/rhi-energy/pull/378), even when `sensor.rhi_energy_release` remains disabled by default.
- Regression coverage `validation/test_live_backend_identity_and_flow_fallback.js` and Energy `tests/regression/test_canonical_release_identity_runtime.py`.

## Immutable five-package TEST matrix
**Foundation F1.8.47** (`v1.8.47`), **Mobility M0.10.53** (`v0.10.53`), **Energy E0.15.140** (`v0.15.140`), **Mobility UX v1.0.0-rc.100** (unchanged) and **Energy UX v4.3.36-rc.22**.

Update Energy and Energy UX, preserving previous immutable Energy **E0.15.139** and Energy UX **v4.3.36-rc.21** as the coordinated rollback pair. Confirm HA restart, accurate footer, no false V2 contract warning and interactive Flow or clearly diagnosed measured fallback. Never infer directional physical flow from unknown measurements and do not actuate chargers automatically.

Wessels target HA Flow exception diagnosis, desktop/iPad render, three-home readback, restart/recovery and rollback **NOT_EXECUTED**. Twelve product acceptance umbrellas OPEN, zero accepted debt policy. **STABLE NO-GO until full physical runtime qualification and separate explicit user approval.**
