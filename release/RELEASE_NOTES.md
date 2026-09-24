# RHI Energy UX v3.97.1 — Home Battery contributor body sizing TEST CANDIDATE

## Scope

3.97.1 is a body-only presentation correction for the Home Battery page.

- Keeps the approved Home Battery hero unchanged.
- Constrains each physical battery contributor to a compact fixed-height card.
- Gives each contributor a dedicated bounded product-image area.
- Forces product artwork to render with centered `object-fit: contain` instead of expanding to intrinsic image dimensions.
- Keeps status, SoC, power, health and state explanation outside the image area.
- Adds tablet and phone sizing rules so tall battery product artwork stays fully visible without taking over the page.
- Adds release-blocking regression coverage for contributor geometry, image containment and hero preservation.

## Compatibility

- Energy UX: 3.97.1
- Required/tested Energy backend: E0.15.32
- Energy contract: R1.89.44_CONTRACT
- Rollback release: v3.97.0
- Accepted technical debt: 0
- Accepted feature debt: 0

Target Home Assistant qualification remains mandatory before stable promotion.
