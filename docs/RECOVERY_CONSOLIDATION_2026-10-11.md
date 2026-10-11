# RHI UX — consolidation, branch retirement and HACS release gate (2026-10-11)

**Status: ENGINEERING RECOVERY / NO STABLE RELEASE.** This is an operational decision record, not target-HA qualification or a claim that all issues are fixed. This record consolidates the previous engineer's handover with the repository-wide UX audit and current GitHub state. Do not mark static CI green as runtime acceptance. GitHub may change after this recorded snapshot.

## Target
Exactly one authoritative `main` in each of the nine RHI repositories; zero orphan/obsolete PRs; historical tags preserved; no old unpublished branch marketed as a HACS release; no release until the exact five-package runtime matrix is qualified. Close superseded PRs only with rationale, preserve still-unique changes through review, and delete remote branches only after independently confirming ancestry / unique content / tag references. Never force-update `main` or immutable tags.

## Nine-repository inventory
| Repository | Branches including main | Open PRs at audit | Main commit at audit |
|---|---:|---:|---|
| rhi-foundation | 75 | 2 | f49ce4d |
| rhi-energy | 179 | 5 | d443925 |
| rhi-mobility | 134 | 2 | 2501325 |
| rhi-ux-core | 33 | 0 | 2eff5c5 |
| rhi-energy-ux | 166 | 1 | b595eb7 |
| rhi-mobility-ux | 149 | 1 | d5cd525 |
| rhi-foundation-hacs | 1 | 0 | a9f9d22 |
| rhi-energy-hacs | 1 | 0 | 7478ea9 |
| rhi-mobility-hacs | 1 | 0 | 98dc070 |
Total: **739 branches / 730 non-main branches / 11 open PRs at inventory time**. Counts are NOT a branch-deletion authorization; every branch's ancestry and unmerged content must be checked.

## Main baseline update since prior engineer's handover
The integrated backend PRs Foundation #116/#117, Energy #256/#257, and Mobility #251/#254 are **MERGED**; old handover assertions saying they were open are historical. The PR-specific merged code is now in the respective main branches. Both UX main branches are still older than their unfinished recovery work; Core 1.6.3 is pinned by both consumers and has green static CI.

## Open-PR disposition at inventory
| Repository | PR | Disposition before closure |
|---|---|---|
| Foundation | #114 | Evergreen handover already identical on main; close as redundant after confirmation |
| Foundation | #113 | Planner wizard design only; preserve design evidence in main before closure |
| Energy | #243 | Tactical planner design file identical on main; close as redundant |
| Energy | #246 | Installation governance wording diff; reconcile on main and close |
| Energy | #247, #249 | Divergent older D0/D1 producers superseded by merged integrated #257; close, do not merge historical producer |
| Energy | #255 | Unique divergent technical/EMHASS changes; reconcile individually against main and integrated tests before closure |
| Mobility | #252, #253 | Standalone inventory/activity changes superseded by merged integrated #254; verify current native contract behavior, then close |
| Energy UX | #215 | Older audit branch is ancestor of work/ux-structural-closure-20261011; preserve actual code on newer work branch. NO merge while canonical-only gate fails |
| Mobility UX | #176 | Actual WIP fix on work/ux-structural-closure-20261011; failing outdated relation smoke and no joint HA qualification. NO merge/release yet |

## P0 UX engineering gaps (audit + handover)
1. Energy UX retains retired `RHI_ENERGY_PUBLIC_CONTRACT_V2` transport in active runtime/screen/selectors (audit branch: 36 static hits; later work handover: 34 hits); cut over complete read/write/overview/planning/consumption/activity/financial/command vertical slices to canonical native publication with zero fallback.
2. Native effective D0/D1 Energy producer exposes `attributes.details.{buckets,planning_assets,source_lanes,consumer_lanes,execution_policy}`; UI `nativePlanningHorizon` wrongly requires `attrs.buckets` and returns `details: attrs`. Adapt to actual producer; distinguish effective and baseline; support incomplete/duplicate/zero/unavailable, explicit period/units, provider, plan id.
3. Planning combined totals/current intent, native execution authorization, strategy/pricing edits and persistence, metering and value attribution, Home Consumption, multibattery/solar hierarchy and source-device links lack complete runtime proof. Never invent totals or EUR.
4. Mobility #176 recovery: lifecycle actual/readback vs writable alias; keep all registered inactive vehicles visible; Commands V2 with optional labels but mandatory executable invoke; physical/configured/effective charger relationships separate; correct artwork and appearance Save/readback; timestamped events vs live status; real Energy Insights.
5. Replace source-token-only regressions with behavior tests. Audit performance, 900ms throttle without guaranteed last update, global HTML recreations, large monolithic runtime/screen modules, mobile/iPad/Safari, translations and literal product copy.

## HACS publication state and anti-drift
The backend HACS mirrors currently describe older **candidate, approved_release=false** source SHAs: Foundation source `228ef373...`, Energy `b684f9f7...`, Mobility `8f9de7ea...`. These differ from the post-integration backend main heads. A clean HACS mirror branch is NOT proof of updated source distribution or acceptance. UX Mobility `v1.0.0-rc.89` is an ordinary GitHub release even though its qualification file lists pending fields; Energy UX `v4.3.36-rc.1` is a prerelease from an older commit than newer WIP code. Do not mutate existing tags or imply qualified release status. Publish **new** immutable versioned candidates only after full local gates, controlled distributable/source manifest equality, supported Foundation baseline, exact target-HA and rollback evidence. Preserve older tags as historical artifacts.

## Engineering execution and branch clean-up
- Recover the latest backend **main** interfaces, build representative real contract fixtures (not inventory-as-live-data), then finish both UX packages on their owning work branches; resolve overlaps instead of cherry-picking entire obsolete PRs.
- Run local source/contract/render/package/HACS/dist-integrity tests BEFORE PR CI. Fix bugs, do not weaken scans or edit tests merely to obtain green.
- Rebase/check against moving main, prove five-way compatibility and exact commit SHA matrix, then merge green, reviewed and runtime-qualified work. Re-run CI on final main.
- Before deleting ANY remote branch, check `git merge-base --is-ancestor origin/<branch> origin/main`, unique commits/patches and whether it is associated with an open PR, immutable tag, release, or still-useful documentation. For diverged histories use explicit review; no blanket deletion, no force push to main.
- After safe consolidation: close PRs with links to merged/retained work; delete their head branches and prior obsolete branches; retain only main and an explicitly approved temporary active engineering branch. Recount and verify default-branch CI and HACS candidate manifests.
- Require joint target Home Assistant installation/upgrade/restart/reload, Foundation provider registration lifecycle, one-to-one source-device links, D0/D1 deterministic+EMHASS, 2 distinct Audi Q8 integrations, all vehicles, physical charger proof, command terminal readback, configuration persistence, pricing periods including DST, Battery/solar hierarchy, EN/NL/FR, iPhone/iPad/desktop, rollback. Do not put PASS where NOT EXECUTED.

## Historical engineer handovers
Energy UX: `docs/ENGINEERING_RECOVERY_HANDOVER_2026-10-11.md`; Mobility UX: `documentation/ENGINEERING_RECOVERY_HANDOVER_2026-10-11.md`. Backend: Foundation `docs/UX_BACKEND_RECOVERY_2026-10-11.md`, Energy `docs/operations/UX_BACKEND_RECOVERY_2026-10-11.md`, Mobility `docs/UX_BACKEND_RECOVERY_2026-10-11.md`. These have been preserved on main with a post-merge checkpoint notice. Preserve their file-level engineering instructions but use current main + producer contract as the source of truth.

**Release decision: NO-GO** until implementation and joint qualification prove complete.
