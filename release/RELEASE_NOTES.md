# v4.1.2 — Canonical multi-object access TEST CANDIDATE

Energy UX now renders physical Home Battery contributors from the canonical Public V2 object graph.

Changes:
- discovers battery contributors beneath the published `battery_system` parent;
- resolves physical properties with the canonical `asset_id + property_key` identity;
- prevents duplicate property keys from two batteries from masking each other;
- routes shared physical power access through asset-scoped lookups;
- adds release-blocking multi-battery collision and reachability tests.

No backend semantic reconstruction was added. RHI UX Core remains pinned to 1.3.1 at `13fc1e1b07f3fcfe9aac960471b74cfd0e96a8b9`.

Backend compatibility: minimum E0.15.52; tested E0.15.56.
Rollback: v4.1.1.

Target Home Assistant runtime proof remains mandatory before stable promotion.
