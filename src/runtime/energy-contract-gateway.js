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
    return Object.freeze({ entityId, state, attrs, contract });
  }
