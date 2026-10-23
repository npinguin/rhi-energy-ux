"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/app/energy-card.js", "utf8");
function extract(begin, end) {
  const a = source.indexOf("\n    " + begin);
  const b = source.indexOf("\n    " + end, a);
  assert.ok(a >= 0 && b > a, "canonical metering editor method missing: " + begin);
  return source.slice(a, b);
}
const methods = vm.runInNewContext(
  "({" + extract("syncMeteringPeriodFromRuntime() {", "runtime() {") + "})",
  { Date, rowValue: (row, fallback) => row?.value ?? fallback }
);
const setup = ({ published = "today", writable = true, feedback = null } = {}) => {
  const row = { property_id: "metering.selected_period", value: published, missing: false };
  const writes = [], renders = [];
  const card = {
    selectedMeteringPeriodId: "today",
    _meteringPeriodHydrated: false,
    writeFeedback: feedback ? { "metering.selected_period": feedback } : {},
    runtime: () => ({ row: () => row, editableProperty: () => writable ? row : null }),
    isWritableRow: candidate => writable && candidate === row,
    requestPropertyWrite: (key, value, source) => writes.push({ key, value, source }),
    render: () => renders.push("render")
  };
  return { card, row, writes, renders };
};

{
  const {card,row} = setup({published:"week"});
  methods.syncMeteringPeriodFromRuntime.call(card);
  assert.equal(card.selectedMeteringPeriodId, "week");
  row.value="month"; // another browser changed canonical Energy options
  methods.syncMeteringPeriodFromRuntime.call(card);
  assert.equal(card.selectedMeteringPeriodId, "month", "live backend readback must supersede old browser state");
}
{
  const {card,writes} = setup({published:"today"});
  methods.syncMeteringPeriodFromRuntime.call(card);
  methods.selectMeteringPeriod.call(card, "week", "value_period_selector");
  assert.equal(card.selectedMeteringPeriodId, "today", "pending write must not optimistically select another period");
  assert.equal(writes.length, 1);
  assert.equal(writes[0].key, "metering.selected_period");
  assert.equal(writes[0].value, "week");
  card.writeFeedback["metering.selected_period"]={state:"verifying"};
  card.runtime().row().value = "week";
  methods.syncMeteringPeriodFromRuntime.call(card);
  assert.equal(card.selectedMeteringPeriodId, "today", "unconfirmed producer changes cannot yet be displayed");
  card.writeFeedback["metering.selected_period"]={state:"accepted"};
  methods.syncMeteringPeriodFromRuntime.call(card);
  assert.equal(card.selectedMeteringPeriodId, "week", "confirmed canonical readback must be displayed");
}
{
  const {card, writes, renders} = setup({published:"today",writable:false});
  methods.selectMeteringPeriod.call(card, "week", "metering_period_selector");
  assert.equal(card.selectedMeteringPeriodId, "today");
  assert.equal(writes.length, 0, "no guessed write route");
  assert.equal(card.writeFeedback["metering.selected_period"].state, "rejected");
  assert.equal(renders.length, 1);
}
{
  const {card, row} = setup({published:"today",feedback:{state:"verifying"}});
  methods.syncMeteringPeriodFromRuntime.call(card);
  row.value="week";
  methods.syncMeteringPeriodFromRuntime.call(card);
  assert.equal(card.selectedMeteringPeriodId, "today");
  card.writeFeedback["metering.selected_period"]={state:"rejected"};
  methods.syncMeteringPeriodFromRuntime.call(card);
  assert.equal(card.selectedMeteringPeriodId, "week", "rejected requests must revert to current backend truth");
}
{
  const before=source.indexOf("\n    persistInteractionContext() {");
  const after=source.indexOf("\n    setConfig(config)", before);
  assert.ok(before>=0&&after>before);
  assert.ok(!source.slice(before,after).includes("selectedMeteringPeriodId:"),
    "selected metering period must never be persisted as browser authority");
  assert.ok(source.includes("this.reconcileWriteFeedback();\n      this.reconcilePendingAppearances();\n      this.syncMeteringPeriodFromRuntime();"),
    "write feedback must settle before backend metering period hydration");
}
console.log("PASS Energy selected period uses only canonical confirmed backend readback; no optimistic period/browser authority");
