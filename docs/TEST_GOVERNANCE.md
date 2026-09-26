# RHI Energy UX Test Governance

This document is normative for Energy UX engineering.

## Core rule

**One invariant has exactly one active test owner.**

The active ownership map is `validation/OWNERSHIP.json`. Historical validators may remain for forensic context without becoming release authority.

## Active test layers

### Contract/domain behavior

Prove Public V2 normalization, current-energy semantics, planning, commands, configuration/write metadata, asset profiles and fail-closed null/unknown behavior.

### UX behavior

Prove user-observable rendering, interaction and feature behavior. Tests must not freeze the private implementation used to achieve it.

### Architecture boundary

Source inspection is allowed for negative dependency rules only:

- product renderers must not read Home Assistant source entities directly;
- product renderers must not read the raw Public V2 object;
- legacy `sensor.energy_*` product surfaces must not regain authority;
- Energy semantics must stay in backend/projection layers, not screens.

### Package/release

Package tests own deterministic output, source/dist integrity and HACS installability. Release tests own projection from the single release descriptor and immutable publication.

## Forbidden active-test patterns

Active release gates must not require exact helper names, positive source expressions, property-access syntax, renderer strings, CSS declarations, historical R3/R4 implementation shapes or duplicated assertions from another owner.

A behavior-preserving refactor must not require broad test rewrites.

## Capability compatibility

Runtime compatibility is contract/capability based. Backend version numbers are release evidence only; they are not the runtime feature switch.

Required product capabilities are the Public V2 transport and canonical Energy core contract. Optional sections such as planning, pricing, strategy and value accounting fail closed independently when absent.

## Qualification

`release/QUALIFICATION.json` contains only evidence that static CI cannot prove: target HA load/render, required contracts, real data, real write/readback, refresh/upgrade and rollback.

## Local-first workflow

```text
edit
→ npm run preflight
→ commit/push
→ CI confirms
→ publish immutable candidate
```

CI is confirmation rather than the primary discovery loop.
