# v4.3.34 — canonical V2 zero-debt candidate

- publish the exact current Energy UX runtime after the canonical V2, performance and zero-debt closures;
- consume **RHI_ENERGY_CANONICAL_PROPERTY_V2** as primary live property truth with surface-scoped invalidation;
- consume **RHI_ENERGY_CANONICAL_OBJECT_V2** for canonical object identity;
- keep **RHI_ENERGY_PUBLIC_CONTRACT_V2** only as bounded compatibility/composed-capability fallback;
- retain lazy/deferred Details, Configuration and Diagnostics updates;
- remove frontend semantic fallbacks that could recreate backend meaning;
- qualify against Energy **E0.15.109**, Foundation **F1.8.42** and Mobility **M0.10.41**.

Rollback: **v4.3.33**.
Known accepted technical debt: **0**.
Known accepted feature debt: **0**.
Target-runtime functional and CPU qualification remains required before stable promotion.
