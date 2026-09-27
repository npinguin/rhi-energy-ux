# v4.2.6 — Gas hero and information-detail closure TEST CANDIDATE

This release closes the remaining visible Energy UX issues after the 4.2.x convergence work.

- fixes the Gas hero to use the approved packaged `gas-hero.webp` artwork;
- rejects the obsolete SVG transport so the hero cannot silently drift back;
- preserves Hero → Status → one Page Controls bar → Body as the only page composition;
- keeps the single status layer and single page-controls surface introduced in the prior releases;
- when canonical live facts are unavailable for a physical Energy device, keeps relevant Source, Profile, Parent and Publication context visible directly in the card instead of collapsing to one generic unavailable message;
- retains the deeper expandable Details disclosure for asset id, type, lifecycle, publication evidence and missing fields;
- keeps backend-owned runtime truth authoritative and does not invent missing telemetry.

Rollback: v4.2.5.

Target Home Assistant render, desktop/iPad proof, functional journey, refresh/restart, upgrade and rollback proof remain separate runtime qualification gates.
