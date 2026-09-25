// Canonical Energy V2 command reader. UX visibility and enablement are backend-owned.
function readEnergyCommandContract(gateway) {
  const v2 = readEnergyPublicV2(gateway);
  const envelope = v2.envelope;
  const roleFor = row => String(row.role || '').trim().toLowerCase();
  const rows = (v2.commands || []).map((value, index) => {
    const row = objectFrom(value);
    const commandId = String(firstDefined(row.command_id, row.action_id, row.command_key, row.id, '') || '');
    const targetAssetId = String(firstDefined(row.target_asset_id, row.asset_id, row.flexible_asset_id, row.planning_target_asset_id, '') || '');
    const visible = asBool(firstDefined(row.visible, row.ux_visible, row.supported), false);
    const enabled = visible && asBool(firstDefined(row.enabled, row.ux_enabled, String(row.availability || '').toUpperCase() === 'AVAILABLE'), false);
    return Object.freeze({
      command_row_id: row.command_instance_id || row.command_row_id || `command_${index + 1}`,
      entity_id: envelope.entityId,
      ...row,
      command_id: commandId,
      target_asset_id: targetAssetId,
      role: roleFor(row),
      contract_valid: !!commandId && !!targetAssetId && !!row.invoke,
      command_owner: String(firstDefined(row.command_owner, row.owner, 'energy') || 'energy'),
      action_kind: String(firstDefined(row.action_kind, row.kind, 'command') || 'command'),
      command_resolved: !!row.invoke,
      currently_applicable: enabled,
      visible,
      enabled,
      blocked_reason:String(firstDefined(row.blocked_reason, row.reason?.message, row.reason?.code, '')),
      user_action_text:String(firstDefined(row.user_action_text, ''))
    });
  });
  return Object.freeze({ envelope, rows, source:'RHI_ENERGY_PUBLIC_CONTRACT_V2' });
}
