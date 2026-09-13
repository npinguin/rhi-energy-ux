// BEGIN GENERATED MODULE: runtime/command-contract.js
// R1.89.39 canonical reader for sensor.energy_command_index. UX visibility and
// enablement are backend-owned. The frontend does not infer readiness from
// command state, physical state, applicability or resolved bindings.
  function readEnergyCommandContract(gateway) {
    const envelope = gateway.contract('commands');
    const attrs = envelope.attributes || {};
    const raw = parseMaybeJson(attrs.commands_json, null) || [];
    const values = Array.isArray(raw) ? raw : [];
    const roleFor = row => String(row.role || '').trim().toLowerCase();
    const rows = values.map((value, index) => {
      const row = objectFrom(value);
      const commandId = String(firstDefined(row.command_id, row.action_id, row.command_key, row.id, '') || '');
      const targetAssetId = String(firstDefined(row.target_asset_id, row.asset_id, row.flexible_asset_id, row.planning_target_asset_id, '') || '');
      const visible = asBool(firstDefined(row.visible, row.ux_visible), false);
      const enabled = visible && asBool(firstDefined(row.enabled, row.ux_enabled), false);
      return Object.freeze({
        command_row_id: row.command_instance_id || row.command_row_id || `command_${index + 1}`,
        entity_id: envelope.entityId,
        ...row,
        command_id: commandId,
        target_asset_id: targetAssetId,
        role: roleFor(row),
        contract_valid: ['start','stop','pause','resume'].includes(roleFor(row)),
        command_owner: String(firstDefined(row.command_owner, row.owner, '') || ''),
        action_kind: String(firstDefined(row.action_kind, row.kind, '') || ''),
        command_resolved: !!row.invoke,
        currently_applicable: enabled,
        visible,
        enabled,
        blocked_reason:String(firstDefined(row.blocked_reason, row.reason?.message, row.reason?.code, '')),
        user_action_text:String(firstDefined(row.user_action_text, ''))
      });
    });
    return Object.freeze({ envelope, rows });
  }
// END GENERATED MODULE: runtime/command-contract.js
