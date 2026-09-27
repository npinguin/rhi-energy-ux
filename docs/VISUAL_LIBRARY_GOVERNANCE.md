# Energy visual library governance

## Ownership

The Energy backend owns Energy semantic identity, `asset_type`, `profile_id`, runtime truth and property publication. Producer domains own their own semantic identity and `visual_ref` assignment.

Every RHI domain that publishes visual identities registers its bounded visual catalog with the Foundation Visual Asset Registry at boot. Foundation owns global registry mechanics, validation, owner/type checking and safe package-relative presentation-locator publication.

Energy UX owns rendering and Energy-owned representative artwork. It does **not** own a second catalog for another domain.

A visual never changes Energy semantics.

## Cross-domain invariant

For a flexible asset originating in another RHI domain:

```text
producer semantic asset
→ producer-owned visual_ref
→ Foundation visual registry
→ Energy preserves visual_ref losslessly
→ Energy UX resolves the registered presentation generically
```

Energy source must not contain another domain's product/brand/model switch statements, image-key aliases, asset-id/display-name inference or hand-maintained `visual_ref → file` maps.

Adding a new producer visual must require zero product-specific Energy source changes.

If a producer ref is missing, unregistered, owner/type-invalid or cannot be rendered, Energy uses a neutral visual state. It must never substitute another real product and must never silently replace the producer identity with an Energy flexible-load hero.

## Energy-owned resolution

For Energy-owned logical assets:

1. Foundation-registered Energy `visual_ref` when published by the backend;
2. explicit Energy UX visual preference where the current product still supports UX-local representative selection;
3. best matching Energy-only representative visual;
4. generic fallback of the same Energy logical type;
5. neutral icon when no catalog exists.

A real logical type must never silently resolve to artwork registered for another type.

## Logical device types

The Energy-owned catalog remains partitioned for Energy logical device types such as battery, battery system, grid connection, solar, gas, price source, home consumption and other Energy-owned assets.

Cross-domain flexible assets are **not** an Energy visual catalog type. Their visual identity remains producer-owned.

## Picker

The Energy picker is available only for Energy-owned visual choices. A Foundation-registered producer-owned ref suppresses the Energy picker.

## Drift prevention

CI must prove:

- producer-domain `visual_ref` remains authoritative and is validated through Foundation registry metadata;
- producer `visual_ref` and `source_domain` survive flexible-asset materialization unchanged;
- Energy source contains no copied Mobility visual manifest or Mobility asset directory;
- Energy source contains no hardcoded producer product/image mapping or producer HACS path;
- unknown/unregistered producer refs fail closed to a neutral visual state;
- a synthetic new registered producer ref traverses the Energy path without product-specific Energy code;
- all screens use the common registry-driven visual resolution path.

Shared governance: Foundation issue #49 / proposed ADR-013. Energy implementation closure: issue #102.
