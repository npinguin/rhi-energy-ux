# RHI UX Release Standard

This document is normative for every public Robotix Home Intelligence UX package.

## Core principles

1. **One source of truth per release concern.**
   - package version: `package.json`;
   - product/release context: `release/product.json`;
   - runtime version: generated from package version during build;
   - qualification evidence: `release/QUALIFICATION.json`;
   - published runtime authority: immutable GitHub Release/tag.

2. **One invariant, one test owner.** Test ownership follows code ownership. Package-specific test governance must define owners and prevent foreign assertions.

3. **Validate once, publish exact bytes.** The full candidate is built and tested on the pull request. Publication verifies and publishes the exact committed distribution artifact; it does not rebuild the runtime.

4. **Published runtime bytes are immutable.** Governance/test/documentation refactors may continue under an already published version only when the deterministic build proves the runtime bytes are identical to the published tag.

5. **Target runtime qualification is evidence, not a rebuild.** Runtime and rollback proof qualify the exact immutable candidate.

## Required lifecycle

```text
branch
→ structural change + owned regression tests
→ PR
→ candidate build
→ complete contract / UX / package / release tests
→ deterministic second-build proof
→ committed-dist equality
→ HACS validation
→ squash merge to main
→ verify committed candidate artifact
→ publish the exact committed artifact as immutable TEST CANDIDATE
→ target Home Assistant runtime + rollback proof
→ qualification bound to exact tag/SHA
→ stable promotion of that exact immutable candidate
```

There is no second full build on main, no publication rebuild and no stable-promotion rebuild.

## Build budget

A normal candidate uses exactly two builds:

1. candidate build used by the complete PR test suite;
2. deterministic reproducibility build compared byte-for-byte with the first.

Publication and stable promotion use zero builds.

A third build requires an explicit engineering reason and must not be part of the normal release workflow.

## Required release identity

Release identity is derived, not independently maintained:

- `package.json` owns the version;
- `release/product.json` owns contract, backend baseline, stage, rollback context and artifact identity;
- build injects the package version into the runtime;
- compatibility/manifest/status metadata must agree with those owners;
- qualification owns runtime evidence for the same candidate;
- release notes and changelog provide human-readable history but do not become competing runtime authorities.

Use `npm run release:sync` when preparing the next candidate.

## Test ownership

Every package must document and machine-check test ownership.

A test may consume another owner's result but may not duplicate its invariant. For example, a footer test may assert footer behavior but may not assert branding transport. A screen-preservation test may assert that a screen exists but may not freeze navigation internals.

When one implementation change breaks several unrelated test owners, classify that as test ownership drift unless multiple product contracts genuinely changed.

## Candidate publication semantics

GitHub Releases are the HACS version authority. A TEST CANDIDATE is a normal GitHub Release so HACS exposes it without a beta/prerelease toggle.

Candidate publication must:

- reject an existing immutable tag/release;
- verify the committed runtime and checksum;
- verify release metadata/qualification identity;
- run HACS package validation;
- publish the exact committed runtime artifact.

Candidate publication must not run `npm test`, `npm run build` or `npm run clean`.

## Qualification semantics

Qualification records fail closed. Unknown, pending or not-executed evidence never counts as PASS.

Stable promotion must prove:

- exact candidate tag exists;
- recorded candidate identity matches the immutable candidate;
- published runtime bytes equal the immutable tag runtime;
- HACS install/update passes;
- core screens render;
- browser refresh/reload passes;
- backend release identity is correct;
- write/readback behavior passes where applicable;
- rollback passes;
- technical debt = 0;
- feature debt = 0.

Stable promotion updates evidence/title only and does not rebuild or mutate runtime bytes.

## Workflow ownership

Exactly three workflows are allowed:

- `validate.yml` — full PR validation and reproducibility proof;
- `publish-hacs.yml` — verify and publish exact committed candidate;
- `release.yml` — evidence-only stable promotion.

Package-specific release governance may strengthen these rules but may not weaken them.
