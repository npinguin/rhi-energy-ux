const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync("src/app/energy-card.js","utf8");

const method = name => {
  const start = app.indexOf("\n    "+name+"(");
  assert.ok(start >= 0, "missing "+name);
  const open = app.indexOf("{", start);
  let depth = 0, quote = null, escaped = false;
  for (let i = open; i < app.length; i += 1) {
    const ch = app[i];
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === "\\") { escaped = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") { quote = ch; continue; }
    if (ch === "{") depth += 1;
    if (ch === "}" && --depth === 0) return app.slice(start, i + 1);
  }
  throw new Error("unterminated "+name);
};

const facts = method("energyAssetFacts");
for (const type of [
  "battery","battery_system","home_battery_system","solar_production","solar_array",
  "solar_panel","solar_optimizer","solar_inverter","grid_connection","gas_meter",
  "flexible_load","flexible_asset","consumer","vehicle","charger","charging_point",
  "site_consumption","home_consumption","backup_interface","energy_system","home_bus"
]) {
  assert.ok(app.includes(type+":["), "missing explicit primary fact contract for "+type);
}
for (const phrase of [
  "State of charge","Power now","Available energy","Capacity","Production now",
  "Produced today","Installed capacity","Efficiency","Energy needed","Meter total",
  "Charging power","Requested power","Grid power","Grid state"
]) assert.ok(facts.includes(phrase), "missing primary fact "+phrase);

assert.match(facts,/valueAtPath\(asset, path\)/, "primary facts must consume explicit published asset values when the indexed field is not materialized");
assert.doesNotMatch(facts,/display_name|friendly_name|asset_id.*match|includes\(name/i, "primary fact resolution must not infer semantics from names");

const device = method("energyDeviceStatusCard");
assert.match(device,/energyAssetAreaLabel/);
assert.match(device,/Part of/);
assert.match(device,/Telemetry not published/);
assert.match(device,/energyAssetDetailDisclosure/);
assert.doesNotMatch(device,/Asset id.*energyDeviceFacts/);

const consumer = method("consumerExplorerCard");
for (const token of ["Energy needed","Planned today","Still to plan","Connected via","energyAssetAreaLabel"]) {
  assert.ok(consumer.includes(token), "managed asset primary grammar missing "+token);
}
assert.match(consumer,/energyAssetDetailDisclosure/);

const battery = method("battery");
for (const token of ["Power now","Available energy","Capacity","Reserve","Health","energyAssetDetailDisclosure"]) {
  assert.ok(battery.includes(token), "Home Battery aggregate primary/details missing "+token);
}

const child = method("batteryChildCard");
assert.match(child,/Telemetry limited/);
assert.match(child,/per-battery power is not published/);
assert.match(child,/energyAssetDetailDisclosure/);

const flowCharger = method("connectorCard");
assert.match(flowCharger,/connection_state/);
assert.match(flowCharger,/physical_power_kw/);
const flowConsumer = method("consumerCard");
assert.match(flowConsumer,/Connected/);
assert.match(flowConsumer,/effective_charger/);

console.log("PASS explicit primary/details contract across Energy object types");
