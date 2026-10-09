# v4.3.34 — canonical-only zero-debt frontend

- require Energy E0.15.109 canonical object/property V2 interfaces;
- make `RHI_ENERGY_CANONICAL_PROPERTY_V2` the sole scalar property authority in the frontend;
- remove Public V2 Core/object/property backfill from normal property rendering and editable-property discovery;
- fail closed with an explicit canonical contract gap when a required property is not published;
- keep Public V2 only for explicit bounded capability/aggregate contracts that have no canonical replacement, never as scalar property truth;
- preserve backend-owned planning totals, availability, health and write semantics;
- keep EN/NL/FR localization and RHI UX Core 1.6.3 presentation ownership;
- add CI ratchets preventing semantic compatibility fallbacks from returning.

Rollback: **v4.3.33**.
Known accepted technical debt: **0**.
Known accepted feature debt: **0**.
Target-runtime qualification remains required before stable promotion.
