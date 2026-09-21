# RHI UX Release Standard

This document is normative for every public Robotix Home Intelligence UX package.

## Release invariants

1. Source, generated runtime, documentation, governance metadata, tests and release evidence must describe one identical candidate version and contract.
2. Runtime/publication-impacting changes always require the next package version. Published tags and runtime assets are immutable.
3. Pull requests are side-effect free. Candidate publication happens only from validated `main`.
4. A TEST CANDIDATE is published as a normal GitHub Release, not as a GitHub prerelease. This makes the version visible in HACS without enabling beta/prerelease versions.
5. TEST CANDIDATE state is carried by package metadata, release title/notes and qualification evidence, never by the GitHub prerelease flag.
6. Candidate publication requires the complete source/package test suite, deterministic/reproducible build proof, HACS validation and committed-dist equality.
7. Target Home Assistant qualification occurs after candidate publication and may update evidence only. It must never modify the immutable tag or runtime payload.
8. Stable promotion is evidence finalization of the exact published candidate. It requires runtime proof, rollback proof and zero accepted technical and feature debt.
9. Stable promotion verifies the immutable tag SHA and published runtime bytes before updating release evidence/title.
10. Rollback is always a previous immutable GitHub/HACS version.
11. Workflow-only, documentation-only and qualification-only changes must not republish an already published runtime version.
12. The repository has exactly three release workflows: validate, publish candidate, stable promotion.

## Required lifecycle

```text
branch
→ PR
→ Validate green
→ squash merge to main
→ main Validate green
→ Publish HACS validation green
→ immutable normal GitHub Release tagged vX.Y.Z / vX.Y.Z-rc.N
   titled TEST CANDIDATE
→ HACS install/update on target Home Assistant
→ runtime proof + rollback proof
→ qualification record bound to exact candidate version/tag/SHA
→ manual stable promotion of that exact immutable candidate
```

## Required release identity

Every package must keep these identities aligned:

- package version;
- source runtime version constant;
- compatibility manifest;
- release manifest;
- release status;
- qualification record;
- current release notes;
- first changelog entry;
- engineer handover;
- generated runtime artifact.

## Candidate publication semantics

GitHub Releases are the HACS version authority. A TEST CANDIDATE is intentionally installable and selectable through normal HACS version selection. Therefore candidate publication must not use `--prerelease`.

The release remains a TEST CANDIDATE until target runtime qualification passes. HACS visibility and qualification status are separate concerns.

## Qualification semantics

Qualification records must fail closed. Unknown, pending or not-executed evidence never counts as PASS.

Stable promotion must prove:

- exact candidate tag exists;
- recorded candidate identity matches the current package;
- published runtime bytes equal the immutable tag runtime;
- HACS install/update passes;
- core screens render;
- browser refresh/reload passes;
- backend release identity is correct;
- write/readback behavior passes where applicable;
- rollback to the previous immutable version passes;
- technical debt = 0;
- feature debt = 0.

## Package-specific implementation

Packages may use different build languages or tests, but may not weaken these invariants. Package-specific release governance documents extend this standard; they do not replace it.
