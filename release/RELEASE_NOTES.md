# v4.2.5 — UX convergence and flexible-flow correction TEST CANDIDATE

This release completes the current Energy UX correction and starts the structural convergence cleanup.

- fixes flexible-device identity materialization so vehicle/charger context survives consistently into Flow and Planning;
- removes the stale frontend assumption that charging-connection telemetry is unavailable;
- restores the Gas hero through the packaged SVG transport;
- keeps backend-owned Energy aggregate truth authoritative instead of reconstructing totals in the frontend;
- keeps one canonical page-control surface after Hero and Status;
- separates navigation/context controls from executable runtime commands;
- keeps shared Hero, Status and Quick Actions primitives owned by RHI UX Core;
- adds a convergence gate against legacy structural markup and hardcoded backend-release assumptions;
- adds a ratchet for historical Energy presentation debt so legacy CSS/release-evolution layers can only decrease.

Rollback: v4.2.4.

Target Home Assistant render, desktop/iPad proof, functional journey, refresh/restart, upgrade and rollback proof remain separate runtime qualification gates.
