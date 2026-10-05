# RHI Energy UX 4.3.29 — canonical Core authority closure candidate

Target Home Assistant showed canonical aggregate truth available on Energy logical objects while some product surfaces still rendered aggregate values unavailable.

4.3.29 closes the frontend authority ordering defect:

- Public V2 `core` is inserted before generic object/configuration rows for global current-home property access;
- duplicate aggregate object keys can no longer shadow Core;
- asset-detail pages retain exact asset-scoped values through `asset_id + property_key`;
- Battery/Solar/Grid/Site/Home aggregate semantics remain backend-owned and are never reconstructed;
- a release-blocking source-order regression prevents the authority inversion from returning.

Tested backend candidate: **E0.15.100**.  
Rollback: **v4.3.28**.  
Known accepted technical debt: **0**.  
Known accepted feature debt: **0**.

Target Home Assistant qualification remains mandatory before stable promotion.
