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
assert.ok(publish.includes("Enforce coordinated source-closure publication freeze"),"HACS authorization missing");
assert.equal(rhiGate.publication_hold,true,"unauthorised HACS publication");
assert.equal(rhiGate.mode,"MANUAL_COORDINATED_SOURCE_CLOSURE_ONLY");
assert.ok(Object.values(rhiGate.approval).every(v=>v===null));

// Explicit HACS TEST pilot is the ONLY permitted pre-runtime publication mode.
const approvalPilot = rhiGate.test_pilot;
const approvedMatrix = {
  foundation:"v1.8.46",mobility:"v0.10.52",energy:"v0.15.138",
  mobility_ux:"v1.0.0-rc.100",energy_ux:"v4.3.36-rc.21"
};
if (JSON.stringify(approvalPilot.matrix) !== JSON.stringify(approvedMatrix) ||
    approvalPilot.status !== "APPROVED_FOR_TEST_PUBLICATION" ||
    approvalPilot.expected_version !== "4.3.36-rc.21" ||
    approvalPilot.expected_tag !== "v4.3.36-rc.21" ||
    approvalPilot.stable_promotion !== "NO_GO" ||
    approvalPilot.runtime_qualification !== "NOT_EXECUTED" ||
    approvalPilot.channel !== "COORDINATED_HACS_TEST_ONLY" ||
    approvalPilot.release_count_limit !== 1 ||
    approvalPilot.immutable_candidate !== true)
  throw new Error("HACS pilot must match exact five-package matrix; stable remains blocked");
for (const token of [
  "source==main==event.get(\"head_sha\")",
  "event.get(\"conclusion\")==\"success\"",
  "event.get(\"head_branch\")==\"main\"",
  "pilot.get(\"matrix\")==approved_matrix",
  "pilot.get(\"stable_promotion\")==\"NO_GO\"",
]) if(!publish.includes(token)) throw new Error("HACS pilot gate must fail closed: "+token);
