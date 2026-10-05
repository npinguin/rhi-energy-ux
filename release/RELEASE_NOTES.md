# RHI Energy UX 4.3.29 — unified semantic projection candidate

- make one canonical Public V2 semantic resolver authoritative for aggregate and asset facts;
- use the same published aggregate object truth across Overview, Flow, Solar, Home Battery and Consumption;
- remove renderer-owned raw asset fallback aliases; property/direct-field normalization now exists only in the V2 adapter;
- preserve contributors as detail only and never reconstruct aggregate battery, solar, grid or consumption values from children;
- make legacy row/value helpers consume the same canonical resolver so older screen code cannot disagree with current-energy projections;
- add cross-surface architecture gates reproducing the observed “value on one page, unavailable on another” failure.

Rollback: **v4.3.28**.  
Known accepted technical debt: **0**.  
Known accepted feature debt: **0**.

Target Home Assistant qualification remains required before stable promotion.
