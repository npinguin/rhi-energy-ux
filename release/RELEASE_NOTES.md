# v4.3.35 — zero-debt canonical property release

- **RHI_ENERGY_CANONICAL_PROPERTY_V2** is the sole frontend authority for product-visible Energy properties;
- missing canonical properties fail closed as contract gaps and are never reconstructed from Public V2;
- remove the final Public V2 property fallback paths and stale compatibility semantics;
- keep aggregate/capability contracts only where they are explicit producer-owned domain contracts, never as substitute property truth;
- preserve surface-scoped invalidation, lazy deep surfaces, EN/NL/FR localization and RHI UX Core ownership;
- enforce CI ratchets that reject semantic compatibility fallbacks.

Rollback: **v4.3.34**.
Known accepted technical debt: **0**.
Known accepted feature debt: **0**.
Target-runtime functional and CPU qualification remains required before stable promotion.
