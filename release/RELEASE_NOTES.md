# v4.2.3 — Information density and single-action-bar correction TEST CANDIDATE

This release corrects the remaining Energy UX regression visible in 4.2.1/4.2.2.

- removes the legacy render-time Quick Actions injection that was inserted after the first closing section and therefore appeared between Hero and Status;
- merges contextual navigation controls and executable commands into one canonical Core-owned Quick Actions bar;
- preserves Hero → Status → Quick Actions → Body as the only page-header composition;
- restores Consumers from the full canonical flexible-asset domain, not only consumer-mix rows;
- restores compact asset provenance/details for Solar and other hardware cards;
- restores Gas meter/source/entity context without duplicating the status summary;
- adds Tactical Planning context (horizon, state, bucket count, participating loads, confidence and reason) while keeping missing hourly allocations fail-closed;
- adds release-blocking tests so a second page-level Quick Actions bar cannot return.

Rollback: v4.2.2.

Target Home Assistant render, functional journey, refresh/restart, upgrade and rollback proof remain separate runtime qualification gates.

