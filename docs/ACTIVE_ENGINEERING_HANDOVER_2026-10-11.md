# Active engineer handover — Energy UX (2026-10-11)

**Status: engineering work not complete; target Home Assistant acceptance BLOCKED.** This is the current handover and supersedes historical branch/PR snapshots in older recovery documents. Never treat green CI or an HACS test candidate as stable runtime qualification.

## Verified repository checkpoint

- Current `main` examined: `0720e50f41b1f87d3aa8e0c19913070b6051ecdf`; HACS test candidate [v4.3.36-rc.5](https://github.com/npinguin/rhi-energy-ux/releases/tag/v4.3.36-rc.5), [main Validate PASS](https://github.com/npinguin/rhi-energy-ux/actions/runs/38155793753), [Publish HACS PASS](https://github.com/npinguin/rhi-energy-ux/actions/runs/38155885230). Re-check these facts from GitHub before work.
- Mobility UX `main` checked: `e3032467e180e877d21de28e696b57048fdc7352`, [v1.0.0-rc.92](https://github.com/npinguin/rhi-mobility-ux/releases/tag/v1.0.0-rc.92).
- Old `fix/canonical-flexible-metering-20261011` branch is not available; its inventory work is in rc.4/rc.5 `main`. Do not revive it or overwrite newer fixes.
- Current `release/QUALIFICATION.json` for rc.5: `candidate_sha=pending`, `release_decision=BLOCKED`, actual runtime checks `NOT_EXECUTED`. **No production/stable GO.**
- No open PRs in either UX repository at the checkpoint. Snapshot SHAs in older handovers may be stale. Canonical version/contract/stage owners are `package.json`, `release/product.json`, GitHub Releases and `release/QUALIFICATION.json`; not this document.

## Engineer mission, boundaries and invariants

Take implementation ownership of both UX products, structure and regressions, run owned local tests, validate via CI, publish immutable HACS test candidates and obtain target-HA runtime/rollback evidence. CI is a gate, not a debugger. Do not hide bugs with aliases, fake metrics, made-up asset inventories, artificial planners, silent zero defaults, guessed HA entity IDs, synthetic costs, readback-free optimistic UX or disabled tests.

**Producer ownership:** Foundation = discovery, source candidates/bindings; Mobility = vehicle/charger facts, physical assignments and command readiness; Energy = canonical Energy logical objects/properties, metering, planners/effective plan, prices and accounting. UX = contract consumption, bounded formatting, placement/navigation and authorized user interactions. Canonical route is published HA object/property/native runtime → `src/runtime/canonical-property-index.js` and `src/runtime/energy-v2-contract.js` → `src/domain/` → `src/app/energy-card.js`. Do not reintroduce retired aggregate Public V2 or create another UX domain authority.

## Immediate P0 engineering closure

**1. Five flexible loads — product inventory independent of readiness.** Diagnostics from 11 Oct show exactly five `object_class=flexible_load` objects: Wallbox garage white, VW ID4, Audi Q8 SUV TFSI e, Audi Q8, BMW X1 xDrive30e. These are a *specific diagnostic fixture*, NEVER a hardcoded asset list. Several have missing current need/target/deadline; only one showed available 11.22 kWh energy-to-target. Current rc.4/rc.5 already changed `FlexibleAssetDomainModel.inventory()/consumerFacing()/planningParticipants()` and Consumption filter. Verify that **every unambiguous canonical object** appears even with zero properties, unknown participation, zero actual power, disabled state or no planning. Asset identity must not be lost when the source is physically a charger. Separate inventory, active participation, planner eligibility (`planning_input_ready === true`) and command authorization. Add owned regression fixtures including duplicate publisher, missing, valid zero, stale and readiness reason. See [#139](https://github.com/npinguin/rhi-energy-ux/issues/139), [#118](https://github.com/npinguin/rhi-energy-ux/issues/118), [#196](https://github.com/npinguin/rhi-energy-ux/issues/196).

**2. Metering / Performance — missing public bridge.** In current `src/runtime/energy-v2-contract.js`, the product projection still explicitly says `metering:{periods:{},available:false,reason:'canonical_period_publication_unavailable'}`. The backend internal `custom_components/rhi_energy/runtime/canonical_semantics.py::metering_rows()` has hour/today/week/month/year values, period quality and costs, but internal Python logic alone does **not** establish an HA-publication contract. Trace the actual producer entity/schema and authority into canonical index/gateway/typed period model and then `meteringPeriods()`, `meteringRowsFromPeriod()`, Performance, Value and Retrospective. If the producer does not materialize an exact public period contract, register a backend-blocking issue; do not reconstruct kWh from instant kW, read private HA states or reintroduce a retired aggregate. Distinguish hour/today OK, week/month/year PARTIAL, unavailable, valid zero and field-level quality. See [#117](https://github.com/npinguin/rhi-energy-ux/issues/117).

**3. Tactical Planning / EMHASS HOLD.** Target diagnostics: `requested_provider=emhass`, `effective_provider=null`, effective D0/D1 `INCOMPLETE`. A deterministic reference calculation is not a fallback execution plan. Maintain rich tactical D0/D1 plan when COMPLETE, otherwise show requested/effective provider, explicit missing inputs, per-asset eligibility, reason and publication quality. No manufactured allocation, financial totals or zero substitutions. Test source→need→forecast→planned→remaining→cost→execution only from published data. See [#139](https://github.com/npinguin/rhi-energy-ux/issues/139), [#118](https://github.com/npinguin/rhi-energy-ux/issues/118).

**4. Configuration editors.** Canonical configuration properties must supply their own editor, constraints, choices, authorized `energy.property.write` route and readback. Separate configured and effective strategy, pricing, automation mode and metering selection. Test edit/cancel/save/failure, permitted transport values, pending state, canonical readback, refresh and restart. Missing write route means explain read-only; do not invent a new service. See [#115](https://github.com/npinguin/rhi-energy-ux/issues/115).

**5. Cross-screen canonical facts.** Grid import on source/supply side only; Grid export on consumption side only if truly exporting. Site Consumption and Home Consumption are separate producer facts. Solar, battery, grid and home are parallel physical participants, not a serial Solar→Battery→Home chain. Maintain charger vs vehicle identities, assignment vs proven physical connection, and source-owned visual refs. Zero actual power is not proof of charging throughput. See [#139](https://github.com/npinguin/rhi-energy-ux/issues/139), [#164](https://github.com/npinguin/rhi-energy-ux/issues/164).

## P1 structural/product debt, still not independently qualified

- Shared AssetPresentationModel, Core card/visual grammar, compact Details vs access-controlled Diagnostics: [#133](https://github.com/npinguin/rhi-energy-ux/issues/133), [#159](https://github.com/npinguin/rhi-energy-ux/issues/159), [#160](https://github.com/npinguin/rhi-energy-ux/issues/160), [#162](https://github.com/npinguin/rhi-energy-ux/issues/162).
- Solar value-first structure, accurate independent physical flow, full inverter/string/optimizer topology: [#163](https://github.com/npinguin/rhi-energy-ux/issues/163), [#164](https://github.com/npinguin/rhi-energy-ux/issues/164).
- Battery aggregate vs contributor state, Gas layout (rc.5 fix must be checked in target HA), visual picker safe fallback/save/readback, tablet/desktop/phone legibility: [#133](https://github.com/npinguin/rhi-energy-ux/issues/133), [#146](https://github.com/npinguin/rhi-energy-ux/issues/146).
- Strategic Planning capability must not route to placeholder; guard by explicit published contract: [#116](https://github.com/npinguin/rhi-energy-ux/issues/116).
- Core localization EN/NL/FR, monolith split with zero behavior drift: [#161](https://github.com/npinguin/rhi-energy-ux/issues/161), [#166](https://github.com/npinguin/rhi-energy-ux/issues/166).
- Financial cost_outlook, energy_outlook, energy_intelligence were INCOMPLETE in diagnostics; remain backend-owned. Retrospective capability READY does not equal full historical period evidence. Surface available partial results and their quality rather than inventing completeness.
- Reconcile redundant tickets (#153/#163, #154/#164, #147/#156, #148/#157, #149/#158) with links/evidence; do not delete open work without proving closure.

## Release and acceptance — authoritative

Read `docs/RELEASE_GOVERNANCE.md`, `docs/UX_RELEASE_STANDARD.md`, `docs/TEST_GOVERNANCE.md`, `src/manifest.json`, `validation/OWNERSHIP.json`. Each vertical slice: source + owned regression → `npm ci` / `npm run validate` → reproducible `dist/` → PR Validate PASS → squash merge → exact-`main` Validate PASS → automatic Publish HACS of that validated immutable package (no rebuild). Intentional version change through `release/product.json`, `package.json`, `npm run release:sync` and `npm run release:check` at publication boundary. Zero GitHub Release assets for nested HACS `dist/`.

**Test candidate != stable.** Actual target-HA installation, all screens mobile/tablet/desktop, canonical consumers and partially absent sources, authorized writes/readback/failure, HA refresh/reload/restart, upgrade and rollback, locales/permissions and physical relationships must pass. Record evidence bound to the exact candidate SHA in `release/QUALIFICATION.json`. Never claim 0% accepted technical/feature debt without evidence.

## Incoming engineer first actions

1. Fetch latest main/release/issue metadata; do not rely on earlier handover SHAs or resurrect vanished branches.
2. Reproduce five-object canonical inventory and current UI with sanitized actual HA fixtures, identify any drop in index→model→card.
3. Trace metering internal function to **actual published HA contract**; if missing, raise precise backend issue. Implement typed adapter only after verifying the publication.
4. Complete P0 slices with owned regression and HA smoke evidence; keep backend dependency tickets linked; then tackle P1 core/layout tech debt.
5. Deliver a new candidate through prescribed Validate/Publish and real target-HA qualification; stable remains blocked otherwise.

Mobility companion: `npinguin/rhi-mobility-ux/documentation/ACTIVE_ENGINEERING_HANDOVER_2026-10-11.md`.
