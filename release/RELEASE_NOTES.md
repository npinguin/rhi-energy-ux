# v4.1.3 — Energy UX grammar and responsive asset experience TEST CANDIDATE

Energy UX keeps all existing tabs while aligning each screen around a more consistent product hierarchy: status, quick details, quick commands, focused body content and asset-level drill-down.

Changes:
- preserves every existing Energy, Intelligence and Insights tab;
- adds a canonical quick-action slot below page status using only backend-published commands;
- adds asset-level quick commands where the canonical command contract publishes them;
- replaces generic property-bag device summaries with typed asset-scoped canonical facts;
- removes remaining synthesized health lookup from product cards;
- enriches physical Home Battery cards without fixed-height clipping;
- expands representative same-type visual fallbacks for Energy assets;
- strengthens responsive image/card behavior for desktop, tablet and phone;
- adds release-blocking grammar and responsive-visual tests.

No backend semantics are reconstructed in the UX. RHI UX Core remains pinned to 1.3.1.

Backend compatibility: minimum E0.15.52.
Rollback: v4.1.2.

Target Home Assistant runtime, Planning/Intelligence, write/readback and rollback proof remain mandatory before stable promotion.
