# RHI Energy UX 4.3.31 — canonical cross-surface projection closure candidate

4.3.31 closes projection drift across current Energy product surfaces while preserving the 4.3.30 target-HA semantic presentation fixes.

- make Public V2 Core the first authority for current Battery, Solar, Grid and Home/Site Consumption truth;
- when Core explicitly has no resolved value, use only the already-published canonical aggregate V2 object as a fail-closed fallback;
- route Overview, Flow, Solar, Home Battery and Consumption through the same current-energy projection;
- remove the independent Solar → Home Battery aggregate semantic path;
- stop rebuilding aggregate Flexible Loads power from participant rows;
- preserve asset-scoped physical details, configuration, diagnostics and contributor cards without promoting them to a second aggregate authority;
- add release-blocking regressions reproducing the target-HA case where Core is unavailable while canonical aggregate objects contain measured values.

Tested backend candidate: **E0.15.100**.  
Rollback: **v4.3.30**.  
Known accepted technical debt: **0**.  
Known accepted feature debt: **0**.

Target Home Assistant qualification remains mandatory before stable promotion.
