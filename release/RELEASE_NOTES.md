# RHI Energy UX 4.3.30 — canonical flexible power envelope candidate

Energy UX now consumes the backend-owned current flexible-load power envelope published by Energy E0.15.101.

- `flexible_loads.available_power_kw` is read from Public V2 Core;
- valid 0 kW remains available and renders as zero;
- missing backend evidence remains unavailable;
- no grid/forecast/battery calculation exists in the frontend;
- D0/D1 planned/still-to-plan totals remain separate kWh planning semantics.

Tested backend candidate: **E0.15.101**.  
Rollback: **v4.3.29**.  
Known accepted technical debt: **0**.  
Known accepted feature debt: **0**.

Target Home Assistant qualification remains mandatory before stable promotion.
