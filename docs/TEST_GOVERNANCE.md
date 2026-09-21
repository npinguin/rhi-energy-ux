# RHI Energy UX Test Governance

This document is normative for Energy UX engineering.

## Core rule

**One invariant has exactly one test owner.**

Tests follow the same ownership model as runtime code. A suite may rely on another owner's invariant, but it may not independently re-implement or freeze that invariant.

The machine-readable map is `validation/OWNERSHIP.json`. The CI gate `validation/validate_test_ownership.py` detects known ownership leakage.

## Active layers

### Contract/domain tests

Own backend → UX normalization and semantics: command contracts, contract gateway behavior, physical flow, consumption truth, current-energy model, planning and related domain projections.

These tests do not own package version, branding transport or release workflow behavior.

### UX behavior tests

Own interaction persistence, stable refresh, navigation behavior and renderer integrity.

They may verify user-visible behavior but must not become a second owner for release identity or branding.

### Shared shell tests

Branding, footer presentation and footer runtime-data safety have explicit separate owners.

- branding owns canonical artwork and delivery;
- footer presentation owns footer geometry/disclosure;
- footer runtime-data owns canonical Energy values and backend release identity used by the footer.

### Package tests

Own HACS structure, generated bundle loadability, public-repository hygiene and committed distribution integrity.

### Release tests

Own package/release identity, immutable publication, qualification binding and workflow shape.

## Historical regression names

Files named after older R3.94.x milestones may remain active when they still protect a useful invariant. Their filename does not give them authority over release identity. Version assertions belong only to release governance.

## Change rule

If one local change causes unrelated owners to fail, first classify whether this is true cross-domain impact or test ownership drift.

Do not update several tests merely to teach them the same new implementation.

## Release/build rule

The pull request owns complete candidate validation:

```text
candidate build
→ all owned suites
→ deterministic second-build proof
→ committed-dist equality
→ HACS validation
```

After squash merge, publication verifies and publishes the exact committed artifact. It does not rebuild.

Stable promotion qualifies/promotes the exact immutable candidate and does not rebuild.

Normal build budget: **2 builds per candidate**.

## Engineer checklist

1. Identify the invariant that changed.
2. Find its owner in `validation/OWNERSHIP.json`.
3. Extend only that owner unless multiple product contracts truly changed.
4. Remove duplicated release/version assertions from domain tests.
5. Prefer behavior/contract assertions over incidental source expressions.
6. Run `npm run validate`.
7. Treat cross-owner failures as architecture findings, not as invitations to copy assertions.
