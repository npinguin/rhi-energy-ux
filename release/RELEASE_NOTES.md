# RHI Energy UX 4.3.22 — LITERAL_PRODUCT_UX_CLOSURE

UX-only release on the unchanged Energy E0.15.86 product contract.

- enforce the compact object grammar: Visual → Key properties / Quick Actions → Configuration → Details → Diagnostics → Children;
- keep Children last and remove technical/raw property dumps from Details;
- consume UX Core 1.5.5 bounded appearance-picker geometry with fixed image viewport, internal scrolling and brand filtering;
- remove ambiguous page-level Quick Actions from Flow, Consumers, Settings and Planning surfaces;
- keep unknown measurements unknown instead of projecting missing consumer/planning values as zero;
- render Flow charger/vehicle relationships with published display identity and never humanise raw charger ids into product copy;
- make Consumers and Operational Planning compact, asset-scoped and visual-first;
- move requested charge power and other writable controls into Configuration;
- make Settings topic-first instead of profile-first;
- render Strategic Planning as the read-only longer-term meaning of Settings instead of mirroring policy tables;
- render Solar Production once, keep physical inverter/string/optimizer/panel hierarchy under Children and separate Details from Diagnostics.

## Candidate baseline

- Foundation **F1.8.35**
- Mobility **M0.10.24**
- Energy **E0.15.86**
- UX Core **1.5.5**
- Energy UX **4.3.22**

Rollback: **v4.3.21**.  
Known accepted technical debt: **0**.  
Known accepted feature debt: **0**.  
Target Home Assistant qualification remains required before stable promotion.
