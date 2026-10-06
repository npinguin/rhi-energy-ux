# RHI Energy UX 4.3.30 — target-HA semantic presentation closure candidate

4.3.30 closes the remaining frontend semantic presentation gaps observed during target Home Assistant review:

- unknown Solar production remains unavailable instead of being presented as “Not generating”;
- unknown Grid flow remains unavailable instead of being presented as “Balanced locally”;
- missing Home Intelligence recommendation remains unavailable instead of defaulting to “No action needed”;
- the Solar screen no longer implies a serial physical path Solar → Battery ↔ Home ↔ Grid;
- Solar, Battery, Home and Grid are presented as independent current-balance positions;
- existing 4.3.28/4.3.29 fixes for product-safe actions, mobile composition and canonical Core authority remain unchanged.

Tested backend candidate: **E0.15.100**.  
Rollback: **v4.3.29**.  
Known accepted technical debt: **0**.  
Known accepted feature debt: **0**.

Target Home Assistant qualification remains mandatory before stable promotion.
