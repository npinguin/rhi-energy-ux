const assert = require("node:assert/strict");
const fs = require("node:fs");

const validate = fs.readFileSync(".github/workflows/validate.yml", "utf8");
const publish = fs.readFileSync(".github/workflows/publish-hacs.yml", "utf8");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const governance = fs.readFileSync("docs/RELEASE_GOVERNANCE.md", "utf8");

assert.ok(!validate.includes("Protect immutable published package"), "engineering Validate must not enforce published-version immutability");
assert.ok(!pkg.scripts.validate.includes("test:release"), "functional/technical validate must not depend on release bookkeeping");
assert.ok(pkg.scripts["release:check"].includes("test:release"), "explicit release boundary command missing");
assert.ok(publish.includes("version_already_published"), "publication must skip already-published engineering versions");
assert.ok(publish.includes("npm run release:check"), "publication boundary must own release metadata validation");
assert.ok(publish.includes("needs.scope.outputs.publish == 'true'"), "publication must be gated by candidate scope");
assert.ok(governance.includes("A normal implementation, defect or governance PR is release-neutral."),
  "release governance must document release-neutral engineering validation");

console.log("PASS Energy UX release lifecycle separation");

const rhiGate = JSON.parse(fs.readFileSync("release/COORDINATED_PUBLICATION_GATE.json","utf8"));
assert.ok(!publish.includes("runtime-qa-") && !publish.includes("Build isolated non-HACS TEST archive")
  && !publish.includes("QA_SOURCE_LOCK.json"),"parallel QA archive publication forbidden");
assert.ok(publish.includes("Require explicit user-requested HACS TEST and exact-main CI"),"Explicit HACS TEST authorization missing");
assert.ok(publish.includes("python3 tools/check_hacs_test_request.py"),"Source-validity gate missing");
assert.equal(rhiGate.publication_hold,true,"default publication hold missing");
assert.equal(rhiGate.mode,"EXPLICIT_USER_REQUEST_HACS_TEST","obsolete source-closure deadlock");
assert.equal(rhiGate.test_request.status,"AUTHORIZED_FOR_TEST","governance PR must not cause release");
assert.equal(rhiGate.stable_release.user_approval_status,"NOT_APPROVED","test is never stable approval");
assert.ok(Object.values(rhiGate.approval).every(v=>v===null));

// Preserve the published 16 October pilot as immutable history without using its matrix
// as authorization for future test packages.
const old=rhiGate.test_pilot;
assert.equal(old.id,"RHI_HACS_TEST_PILOT_2026_10_16");
assert.equal(old.stable_promotion,"NO_GO");
assert.equal(old.immutable_candidate,true);
const checker=fs.readFileSync("tools/check_hacs_test_request.py","utf8");
const stableChecker=fs.readFileSync("tools/check_stable_user_approval.py","utf8");
const stableWorkflow=fs.readFileSync(".github/workflows/release.yml","utf8");
assert.ok(checker.includes('req.get("status") == "AUTHORIZED_FOR_TEST"'));
assert.ok(checker.includes('event.get("head_sha") == source_sha == main_sha'));
assert.ok(checker.includes('event.get("head_branch") == "main"'));
assert.ok(checker.includes('req.get("release_count_limit") == 1'));
assert.ok(stableChecker.includes('stable.get("user_approval_status") == "APPROVED"'));
assert.ok(stableWorkflow.includes("python3 tools/check_stable_user_approval.py"));
