# RHI Energy UX 4.3.11 — AUTOMATION_AUTHORITY

- Align the UX with Energy E0.15.77 execution-authority semantics.
- Advice is the safe fallback; missing mode never renders as Automatic.
- Operational Planning shows whether the current plan is advisory, executable automatically, or informational only.
- Advice waits for explicit user approval before managed plan execution.
- Automatic may execute the current canonical D0 plan subject to backend readiness/readback gates.
- Disabled keeps planning visible but blocks managed plan execution.
- Managed-asset guidance is mode-aware and no longer promises automatic action while in Advice.
- Preserve 4.3.10 managed-consumer, Metering, Value, Retrospective and Strategic closures.

Minimum/tested backend: **E0.15.77**.
Known accepted technical debt: **0**.
Known accepted feature debt: **0**.

Target Home Assistant qualification remains required before stable promotion.
