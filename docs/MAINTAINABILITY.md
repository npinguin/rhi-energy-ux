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
7. immutable release version.

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
