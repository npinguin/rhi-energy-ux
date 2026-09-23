# RHI Energy UX v3.95.4 — Flow and Metering hero family correction TEST CANDIDATE

## Scope

Focused visual asset correction over v3.95.3.

Flow and Metering still used legacy hero artwork that did not match the approved Energy image family. v3.95.4 replaces only those two hero assets while preserving the v3.95.3 Mobility-parity layout, status row, Quick Actions hierarchy and Energy runtime semantics.

## User experience

- Replaces the legacy Flow hero with a dedicated 2172×724 Energy Flow image.
- Replaces the legacy Metering hero with a dedicated 2172×724 Metering image.
- Both images use the approved hero-safe composition: quiet left copy zone and primary Energy subject on the right.
- Preserves the current hero clipping/crop contract and all existing tab mappings.
- No other hero assets are changed in this release.

## Contract and compatibility

- Energy UX: 3.95.4
- Minimum backend: E0.15.25
- Public compatibility surface: R1.89.44_CONTRACT
- Backend/domain contract delta: none
- Accepted technical debt: 0
- Accepted feature debt: 0
- Rollback release: v3.95.3

## Qualification

Static/package validation is required before publication. Target Home Assistant runtime proof must confirm Flow and Metering hero family alignment and crop visibility on the installed candidate.
