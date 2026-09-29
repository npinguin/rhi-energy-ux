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
