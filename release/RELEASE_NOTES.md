# v4.3.36-rc.3 — Native D0/D1 planning-quality and bucket semantics (HACS TEST CANDIDATE)

The installed Energy E0.15.116 diagnostics show an EMHASS provider hold (`effective_provider=null`), a deterministic baseline plan that is not selected as effective, and incomplete D0/D1 horizons. The frontend must distinguish actual numeric planning metrics, effective plan quality, and baseline nonexecutability.

- Numeric D0/D1 native metrics may be visible as provisional evidence; they do **not** establish an AVAILABLE or executable effective plan.
- A complete effective `RHI_ENERGY_PLANNING_HORIZON_V1` producer is required, with provider selection, `attributes.details`, published buckets and exact execution policy. Missing/duplicate/incomplete publications fail closed and disclose the provider reason.
- The canonical native bucket adapter now accepts `ENERGY_NATIVE_PLANNING`; old R1.79.x adapters must not reject valid native buckets, infer Home/Grid lanes, or derive kWh from a power value and a guessed duration.
- New regressions protect provider HOLD, missing horizon and real zero values.
- HACS source/package/CI validation is separate from target Home Assistant functional qualification. **Not stable.**

Compatibility: Energy backend E0.15.116 or newer with the native horizon contract, Foundation F1.8.44, UX Core 1.6.3. Rollback UX: v4.3.36-rc.2. The EMHASS missing solar forecast slot is backend evidence and is **not resolved by this frontend release**.
