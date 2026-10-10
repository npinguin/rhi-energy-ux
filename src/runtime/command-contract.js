// Backend-owned canonical Energy property write capabilities. No Public V2
// command list or frontend-created command authority.
function readEnergyCommandContract(gateway) {
  const index=gateway?.host?.canonicalIndex;
  const candidates=index?.productRows?.() || [];
  const rows=candidates.filter(row=>
    row.write_supported === true && row.editable === true &&
    row.write && typeof row.write === 'object'
  ).map(row=>{
    const write=row.write;
    const operationId=String(write.operation_id || row.operation?.operation_id || '').trim();
    const readback=String(write.readback_property || row.property_key || '').trim();
    const valid=operationId === 'energy.property.write' && !!readback;
    return Object.freeze({
      command_row_id:String(row.asset_id)+'::'+String(row.property_key),
      entity_id:row.entity_id || null,
      command_id:operationId,
      target_asset_id:String(row.asset_id),
      property_key:String(row.property_key),
      role:String(row.presentation_role || ''),
      contract_valid:valid,
      command_owner:'energy',
      action_kind:'property_write',
      command_resolved:valid,
      currently_applicable:valid && row.availability==='AVAILABLE',
      visible:row.presentation_technical !== true,
      enabled:valid && row.availability==='AVAILABLE',
      blocked_reason:valid ? '' : 'canonical_write_operation_incomplete',
      invoke:valid ? Object.freeze({...write}) : null,
      user_action_text:String(row.display_name || row.property_key)
    });
  });
  return Object.freeze({
    envelope:Object.freeze({source:'RHI_ENERGY_CANONICAL_PROPERTY_V2'}),
    rows:Object.freeze(rows),
    source:'RHI_ENERGY_CANONICAL_PROPERTY_V2'
  });
}
