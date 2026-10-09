# v4.3.33 — canonical property performance architecture

- prefer direct `RHI_ENERGY_CANONICAL_PROPERTY_V1` property entities for product truth, with Public V2 retained only as bounded compatibility fallback;
- index canonical Energy properties persistently instead of rebuilding aggregate state for every Home Assistant refresh;
- scope active subscriptions by backend-owned presentation surface so irrelevant HA state updates do not invalidate the active view;
- suppress aggregate Public V2 churn as a normal telemetry dirty-trigger once direct canonical properties are available;
- preserve fail-closed availability, backend-owned planning totals, EN/NL/FR localization and RHI UX Core 1.6.3 presentation ownership;
- add release-blocking tests for metadata-owned placement and incremental canonical-property refresh.

Rollback: **v4.3.32**.
Known accepted technical debt: **0**.
Known accepted feature debt: **0**.
Target-runtime qualification remains required before stable promotion.
