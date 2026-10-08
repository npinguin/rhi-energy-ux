# v4.3.33 — canonical runtime performance

- introduce direct canonical Energy property indexing for `RHI_ENERGY_CANONICAL_PROPERTY_V1` while keeping Public V2 as a bounded compatibility fallback;
- stop aggregate Public V2 churn from forcing whole-view rebuilds when the active surface is already covered by canonical properties;
- track canonical changes by asset, property and presentation surface before scheduling UI work;
- defer closed Details, Configuration and Diagnostics updates and refresh them when the user opens the relevant surface;
- keep incomplete presentation metadata fail-closed as a contract gap rather than deriving frontend placement;
- prevent duplicate property keys from becoming ambiguous global truth;
- preserve existing Energy product behaviour, EN/NL/FR localization and backend-owned planning/availability semantics.

Rollback: **v4.3.32**.
Known accepted technical debt: **0**.
Known accepted feature debt: **0**.
Target-runtime qualification remains required before stable promotion.
