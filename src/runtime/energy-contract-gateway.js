// Single backend-access owner for Energy UX public product contracts.
  function createEnergyContractGateway(host) {
    const cache = new Map();
    const entityId = contractKey => {
      const key = String(contractKey || '');
      const configured = UX_INTERFACES[key];
      if (!configured) throw new Error(`unknown_energy_contract:${key}`);
      return configured;
    };
    const state = contractKey => {
      const id = entityId(contractKey);
      if (!cache.has(id)) cache.set(id, host.state(id) || null);
      return cache.get(id);
    };
    const attrs = contractKey => state(contractKey)?.attributes || {};
    const canonicalStates = (contractId = '') => {
      const wanted = String(contractId || '').trim().toUpperCase();
      if (!wanted) return [];
      return Object.values(host.hass?.states || {}).filter(row =>
        String(row?.attributes?.canonical_contract || '').trim().toUpperCase() === wanted
      );
    };
    const canonicalPropertyRows = () => canonicalStates('RHI_ENERGY_CANONICAL_PROPERTY_V2').map(row => {
      const a = row?.attributes || {};
      return Object.freeze({
        ...a,
        entity_id:String(row?.entity_id || ''),
        asset_id:String(a.asset_id || ''),
        object_class:String(a.logical_object_class || ''),
        property_key:String(a.property_key || ''),
        value:Object.prototype.hasOwnProperty.call(a, 'value') ? a.value : row?.state,
        display_name:String(a.display_name || a.friendly_name || ''),
        unit:String(a.unit || a.unit_of_measurement || ''),
        availability:String(a.availability || (row?.state === 'unavailable' ? 'UNAVAILABLE' : 'AVAILABLE')).toUpperCase()
      });
    }).filter(row => row.asset_id && row.property_key);
    const canonicalObjectRows = () => canonicalStates('RHI_ENERGY_CANONICAL_OBJECT_V2').map(row => {
      const a = row?.attributes || {};
      return Object.freeze({
        ...a,
        entity_id:String(row?.entity_id || ''),
        asset_id:String(a.asset_id || ''),
        object_class:String(a.logical_object_class || ''),
        display_name:String(a.display_name || a.friendly_name || a.asset_id || ''),
        state:row?.state ?? null
      });
    }).filter(row => row.asset_id);
    const contract = contractKey => {
      const id = entityId(contractKey);
      const current = state(contractKey);
      const attributes = current?.attributes || {};
      return {
        contractKey,
        entityId: id,
        state: current?.state ?? null,
        attributes,
        contractVersion: String(firstDefined(attributes.contract_version, attributes.release, '')),
        available: !!current
      };
    };
    return Object.freeze({
      entityId, state, attrs, contract,
      canonicalStates,
      canonicalPropertyRows,
      canonicalObjectRows
    });
  }
