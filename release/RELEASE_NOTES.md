# RHI Energy UX 4.3.27 — canonical V2 boundary closure candidate

Follow-up candidate on **Foundation F1.8.38 / Mobility M0.10.25 / Energy E0.15.87 / UX Core 1.6.0**.

- enforce `RHI_ENERGY_PUBLIC_CONTRACT_V2` as the sole Energy product-state ingress through the runtime gateway;
- remove screen-level Home Assistant state and contract discovery from the Energy card;
- make Gas history consume only an explicitly Public-V2-published history/statistics entity reference and fail closed when absent;
- strengthen architecture validation so renderers cannot regain direct `hass.states` discovery;
- preserve backend-owned planning, metering, value, strategy, command and write/readback semantics;
- keep missing canonical backend truth unavailable instead of recovering it from parallel or legacy indexes.

Rollback: **v4.3.26**.  
Known accepted technical debt: **0**.  
Known accepted feature debt: **0**.

Target Home Assistant qualification remains mandatory before stable promotion.
