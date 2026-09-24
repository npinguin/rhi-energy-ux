# Home Intelligence Energy UX Architecture

## Canonical dependency direction

```text
page
→ reusable component
→ normalized view model
→ contract-family module
→ Energy Contract Gateway
→ canonical public backend owner
```

Reverse dependencies are forbidden.

## Responsibilities

### Public Interface Registry

Owns exact interface identity. It does not infer aliases, scan suffixes or use internal/diagnostic entities for product truth.

### Energy Contract Gateway

Owns Home Assistant state access, contract envelopes, availability, version metadata and bounded caching/invalidation.

### Contract-family module

Owns parsing, validation, schema-shape normalization, zero/null preservation and the meaning of one contract family.

### Normalized view model

Combines canonical meanings into a stable renderer input. It does not expose backend paths or create a new business owner.

### Reusable component and renderer

Owns layout, formatting, visual filtering, accessibility and explicit user interaction. It does not parse contracts, infer readiness or calculate business truth.

## Current modules

- `src/runtime/public-interface-registry.js`
- `src/runtime/energy-contract-gateway.js`
- `src/domain/planning/planning-contract.js`
- `src/domain/planning/planning-view-model.js`
- `src/runtime/command-contract.js`
- `src/runtime/command-action-model.js`
- `src/runtime/consumption-contract.js`
- `src/domain/models/physical-flow-view-model.js`
- `src/domain/models/metering-status-model.js`

Physical Flow uses the relation-owned view-model boundary. Add further modules only when closing proven ownership drift—not as a big-bang rewrite.

## Semantic projections

- Planning: advisory horizons, commitments, totals and current operational intent.
- Physical Flow: measured relation power and topology only.
- Consumption: canonical Site Consumption, Home Consumption and Flexible Loads.
- Commands: published actions and literal invoke.
- Control state: mode, physical state, origin and participation separated.
- Metering: periodized measured energy and measurement lifecycle.
- Configuration: editable public properties and authoritative readback.
- Retrospective: backend-owned outcome review.
- Value: backend-owned financial interpretation.

## Forbidden dependencies

- pages/components reading `sensor.energy_*` directly;
- widgets parsing raw backend rows;
- screen-local command or property routes;
- Planning totals sourced from another interface;
- Flow values sourced from need/request/plan semantics;
- action applicability used as control mode;
- direct edits to generated distribution;
- local compatibility fallback without a documented owner and expiry.

## Performance boundary

The gateway and model layer must prevent repeated whole-contract parsing per cell/render. Updates should invalidate only affected models. Re-renders must preserve user tab, selection, disclosure, scroll and draft state.

## Test architecture

Test ownership mirrors runtime ownership.

```text
contract/domain owners
        ↓
UX behavior owners
        ↓
shared shell owners
        ↓
package verification
        ↓
release/qualification gates
```

An invariant is asserted by exactly one owner. Other suites may rely on it but may not freeze its implementation. The normative map is `validation/OWNERSHIP.json`; see `docs/TEST_GOVERNANCE.md`.

Cross-owner assertions are test technical debt because they make unrelated changes fail together and recreate the same drift this architecture is designed to prevent.

## Physical source/package architecture

The repository structure is part of the architecture contract: `src/app`, `src/runtime`, `src/domain`, and `src/assets` have explicit ownership. `src/manifest.json` owns build composition. `dist/` is generated and is the complete HACS install package; it is never edited as source.

## Canonical Energy V2 asset context

Energy UX may consume `sensor.rhi_energy_public_contract_v2` only through the
runtime interface registry/gateway and `runtime/asset-profile-contract.js`.

The backend owns:

- canonical `asset_type`;
- read-only Energy `profile_id`;
- the Energy asset-profile catalog;
- participation / operating / availability conclusions that are published on the asset;
- per-object property-publication completeness.

The UX owns presentation only. It must not infer semantic identity from display names,
entity ids, commercial artwork or image keys. It must not infer operational state from
power thresholds. Missing canonical state remains unknown/unavailable.

Energy profiles currently have `profile_scope=domain_asset_type` and are read-only.
No profile picker is shown until the backend explicitly publishes an editable profile
contract with canonical choices and write/readback capability.

