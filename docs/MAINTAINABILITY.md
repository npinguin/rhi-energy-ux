# Maintainability Standard

## Objective

The Energy UX must be changeable without patch-on-patch behaviour. Every user-visible concept has one data owner, one projection path, one renderer and one active style owner.

## Mandatory structure

```text
Public Home Assistant contract
        ↓
contract reader
        ↓
normalized immutable view model
        ↓
component renderer
        ↓
canonical component stylesheet
```

Renderers do not read internal entities, perform owner selection, reconstruct commands or calculate planning/business meaning.

## One-owner rules

1. A concept may be read from one public owner only.
2. Fallbacks across owners are forbidden in product renderers.
3. A missing public contract produces an explicit unavailable state, not discovery or reconstruction.
4. Compatibility logic, when temporarily necessary, lives in one named adapter with an expiry condition and dedicated tests.

## Component rules

- One component function per repeated visual structure.
- One CSS selector owner per component.
- No release-labelled override blocks in the active stylesheet.
- No duplicate selectors with conflicting declarations.
- No selector mutation through regex-based patching.
- Breakpoints are defined once per component family.
- Numeric columns use tabular figures and a fixed aligned value column.

## Semantic rules

- `0.0` and `null` are never interchangeable.
- User-facing Intelligence text is backend-published.
- Command role, visibility, enablement and blocked reason are backend-published.
- UX may format units, labels and layout; it may not create new domain facts.

## Change workflow

Every change must include:

1. explicit owner and source field;
2. renderer/component impacted;
3. screens that must not change;
4. fixture proving zero, null, visible, disabled and missing states;
5. desktop/tablet/mobile render check;
6. documentation and usage-model update;
7. owning regression test(s) only;
8. immutable release version when runtime bytes change.

## Definition of zero technical debt

A release is zero-tech-debt only when:

- active code has no superseded release override blocks;
- no compatibility fallback lacks an owner and removal condition;
- documentation matches code and package metadata;
- all modified behaviour is fixture-tested;
- no known P0/P1 maintainability defect remains undocumented;
- generated and distribution artifacts are reproducible from source.

## Runtime rendering rule

A Home Assistant `hass` assignment is not itself a reason to rebuild the card. Rendering is limited to changes in entities used by the active tab. Same-view updates use incremental DOM reconciliation; full markup replacement is reserved for an actual view change. This prevents image reload flicker, preserves interaction context and reduces iPad repaint pressure.

## Canonical current-energy rule

Literal aggregate current-energy contract keys are allowed only in `runtime/current-energy-view-model.js`. Screen renderers consume immutable view-model fields. They may format values but may not infer Battery direction, apply local deadbands, choose between charge/discharge properties or change zero/null semantics.


## Source authority

`source/homebrain-energy-card.js` is the canonical runtime source for the current legacy bundle generation. Files under `source/modules/` are synchronized contract/view-model mirrors used for isolated tests and drift checks; they are not a second runtime publication path. The build fails when a mirrored generated block differs from the canonical source.

Do not create a second hand-maintained bundle or parallel compatibility implementation. True module bundling is a separate future refactor and must not be mixed into release-fix work.

## Test maintainability rule

The one-owner rule applies to tests as strongly as it applies to runtime code. A test suite owns an invariant, not a historical implementation. Release/version checks belong to release governance; branding transport belongs to branding validation; footer rendering belongs to footer validation; navigation behavior belongs to its UX owner.

Governance-only or test-only changes do not require fake version churn when the deterministic build proves runtime bytes are identical to the published tag.
