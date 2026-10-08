# v4.3.33 — canonical domain interface

- consume **RHI_ENERGY_CANONICAL_PROPERTY_V2** as the first authority for live Energy property truth;
- consume **RHI_ENERGY_CANONICAL_OBJECT_V2** for direct canonical object identity;
- preserve backend-owned availability, quality, write and presentation metadata on the direct property surface;
- subscribe the dashboard to canonical object/property entities so live updates no longer depend solely on the giant Public V2 state;
- keep **RHI_ENERGY_PUBLIC_CONTRACT_V2** temporarily for Planning, Metering, Retrospective and other composed capabilities not yet cut over;
- fail closed and never infer presentation from property names;
- qualify against Energy **E0.15.109**, Foundation **F1.8.42** and Mobility **M0.10.41**.

Rollback: **v4.3.32**.
Known accepted technical debt: **0**.
Known accepted feature debt: **0**.
Target-runtime functional and CPU qualification remains required before stable promotion.
