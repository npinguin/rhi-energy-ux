# RHI Energy UX 4.3.29 — single projection authority closure

- make one canonical V2 aggregate resolver the semantic owner for live Battery, Solar, Grid, Site Consumption and Home Consumption truth;
- route Overview, Flow, Solar, Home Battery and Consumption through the same current-energy projection;
- remove the independent Solar-page Home Battery aggregate path that could disagree with Overview and Home Battery;
- keep physical contributor cards asset-scoped while preventing contributors from becoming a second aggregate authority;
- remove frontend reconstruction of flexible-load live power and planning need when backend-owned aggregate/planning totals are available;
- normalize already-published aggregate object fields once inside the V2 adapter, with same-contract core values only as a fail-closed fallback;
- retain the 4.3.28 target-UX, command, responsive and user-safe-copy fixes.

Rollback: **v4.3.28**.  
Known accepted technical debt: **0**.  
Known accepted feature debt: **0**.

Target Home Assistant runtime and rollback qualification remain separate gates before stable promotion.
