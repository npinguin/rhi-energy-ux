# RHI Energy UX 4.3.28 — target Home Assistant UX closure candidate

- keep page-level actions product-scoped so ambiguous asset Start/Stop and repeated per-device commands no longer leak into headers;
- deduplicate commands and suppress contradictory Start/Stop or Pause/Resume combinations based on published state;
- fail closed in Overview intelligence when the canonical live Energy balance is incomplete;
- keep opaque IDs, provider states and technical relationship wording out of normal product UX;
- distinguish an available current gas meter from unavailable historical statistics;
- remove duplicate Appearance actions;
- make Battery, Gas and Solar asset compositions flow correctly on phone widths without presentation debt.

No Energy measurements are reconstructed in the frontend. Missing Public V2 truth remains unavailable.

Rollback: **v4.3.27**.  
Known accepted technical debt: **0**.  
Known accepted feature debt: **0**.

Target Home Assistant qualification remains mandatory before stable promotion.
