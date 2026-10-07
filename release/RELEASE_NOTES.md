# v4.3.32 — pilot localization and Core convergence

- converge Energy UX on the current shared RHI UX Core 1.6.3 commit `56560ba61893089b3e0ab8b6535fd777a799066b`;
- expand EN/NL/FR product localization across the primary pilot surfaces: Overview, Flow, Gas, Home Battery, Flexible Loads, Settings, Metering, Value and Planning;
- route primary pilot-visible copy through stable localization keys instead of embedded English literals;
- add a release-blocking source guard for key pilot-visible literals bypassing localization;
- preserve the 4.3.31 canonical Energy projection and fail-closed V2 ownership model;
- reset target-Home-Assistant qualification because shared Core and rendered product copy changed.

Rollback: **v4.3.31**.
Known accepted technical debt: **0**.
Known accepted feature debt: **0**.
Target-runtime qualification remains required before stable promotion.
