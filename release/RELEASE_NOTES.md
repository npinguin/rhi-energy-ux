# v4.3.33 — canonical runtime performance

- introduce direct canonical Energy property indexing for `RHI_ENERGY_CANONICAL_PROPERTY_V2` while keeping Public V2 as a bounded compatibility fallback;
- stop aggregate Public V2 churn from forcing whole-view rebuilds when the active surface is already covered by canonical properties;
- track canonical changes by asset, property and presentation surface before scheduling UI work;
- defer closed Details, Configuration and Diagnostics updates and refresh them when the user opens the relevant surface;
- keep incomplete presentation metadata fail-closed as a contract gap rather than deriving frontend placement;
- prevent duplicate property keys from becoming ambiguous global truth;
- consume RHI_ENERGY_CANONICAL_OBJECT_V2 for canonical object identity while RHI_ENERGY_CANONICAL_PROPERTY_V2 owns live property truth;
- preserve existing Energy product behaviour, EN/NL/FR localization and backend-owned planning/availability semantics;
- qualify against Energy E0.15.109, Foundation F1.8.42 and Mobility M0.10.41.

Rollback: **v4.3.32**.
Known accepted technical debt: **0**.
Known accepted feature debt: **0**.
Target-runtime qualification remains required before stable promotion.
