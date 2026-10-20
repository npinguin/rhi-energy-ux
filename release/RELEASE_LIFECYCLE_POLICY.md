# Energy UX release governance — two-stage workflow

Authority: [Foundation #129](https://github.com/npinguin/rhi-foundation/issues/129) and [two-stage policy](https://github.com/npinguin/rhi-foundation/blob/main/governance/TWO_STAGE_RELEASE_GOVERNANCE.md).

**HACS TEST** can be published to support real runtime testing only after an explicit user's request, one-time `test_request` approval for the exact current tag, immutable full five-package version matrix, and successful source/consumer CI on exact main. No twelve-umbrella source closure or physical qualification is necessary to test, but all unfinished acceptance stays OPEN. Automatic source merges cannot publish, and no tag is overwritten.

**Official STABLE** is withheld until the source/UX product requirements and real Home Assistant installation/runtime/restart/rollback evidence PASS and the user **separately** approves the exact stable version. Both checks are enforced in the stable workflow; release dispatch is not approval.
