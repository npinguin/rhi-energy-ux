# RHI Energy UX 4.3.29 — canonical projection closure

- converge Overview, Flow, Solar, Home Battery and Consumption on one current-energy projection;
- normalize already-published aggregate object truth and core truth once inside the Public V2 adapter;
- remove frontend fallback sums for Flexible Loads current power and planning need;
- route Gas through a domain selector instead of parsing raw object properties in the renderer;
- make the Solar Home Battery section reuse the exact same aggregate battery projection as Overview, Flow and Home Battery;
- keep physical child assets as detail projections without recalculating aggregate truth;
- add architecture gates preventing cross-surface semantic paths from drifting apart again.

No Energy measurements or planning totals are reconstructed in the frontend. Missing Public V2 truth remains unavailable.

Rollback: **v4.3.28**.  
Known accepted technical debt: **0**.  
Known accepted feature debt: **0**.

Target Home Assistant runtime and rollback qualification remain mandatory before stable promotion.
