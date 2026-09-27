# v4.2.7 — Gas hero binary integrity TEST CANDIDATE

This hotfix preserves the 4.2.6 UX-detail closure and fixes the remaining Gas hero rendering failure.

- replaces the corrupt file that carried a `.webp` extension without valid WebP bytes;
- packages the approved Gas hero as a real RIFF/WEBP image;
- adds a release-blocking magic-byte check so an invalid WebP cannot pass validation again;
- preserves the 4.2.6 single page-controls surface, Hero → Status → Page Controls → Body order and richer physical-device detail context;
- keeps runtime truth backend-owned and does not invent missing telemetry.

Rollback: v4.2.6.

Target Home Assistant render, iPad/desktop proof, functional journey, refresh/restart, upgrade and rollback proof remain separate runtime qualification gates.
