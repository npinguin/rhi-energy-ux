// ---- src/domain/models/flexible-asset-model.js ----
class FlexibleAssetDomainModel {
    constructor(runtime) {
      this.runtime = runtime;
      this._all = null;
      this._byId = null;
    }
    isStorage(asset = {}) {
      return /battery|storage/i.test(`${asset.ux_asset_type || ''} ${asset.asset_type || ''} ${asset.flexible_role || ''} ${asset.category || ''}`);
    }
    planningFor(assetId) {
      return this.runtime.planningOutcomeFor(assetId) || {};
    }
    participationState(asset = {}, planning = {}) {
      if (this.isStorage(asset)) return 'storage';
      const explicit = String(firstDefined(
        asset.participation_state,
        asset.automation_participation,
        asset.planning_participation,
        asset.lifecycle_state,
        asset.lifecycle_status,
        ''
      ) || '').toLowerCase();
      const disabledReason = `${firstDefined(asset.availability_reason,'')} ${firstDefined(planning.waiting_reason,planning.waiting_reason_code,planning.reason,'')}`.toLowerCase();
      const enabled = firstDefined(asset.enabled, asset.planning_enabled, asset.participating, true);
      if (['disabled','excluded','off','not_participating','not participating'].includes(explicit)) return 'disabled';
      if (!asBool(enabled, true) || /disabled|excluded|not.participating/.test(disabledReason)) return 'disabled';
      const availability = String(firstDefined(asset.availability_state, asset.operating_state, '') || '').toLowerCase();
      if (['unavailable','disconnected','offline','blocked'].includes(availability)) return 'temporarily_unavailable';
      return 'participating';
    }
    operationalState(asset = {}, planning = {}) {
      const raw = String(firstDefined(asset.operating_state, asset.operation_state, planning.state, planning.status, '') || '').toLowerCase();
      if (/paused|hold/.test(raw)) return 'paused';
      if (/starting/.test(raw)) return 'starting';
      if (/stopping/.test(raw)) return 'stopping';
      if (/active|charging|running|executing/.test(raw) || (asNumber(firstDefined(asset.power_kw,asset.current_power_kw,asset.actual_power_kw)) || 0) > 0.05) return 'active';
      if (/planned|selected/.test(raw) || asBool(planning.planned, false) || asBool(planning.selected, false)) return 'planned';
      if (/waiting|pending/.test(raw) || asBool(planning.waiting, false)) return 'waiting';
      if (/unavailable|offline|disconnected|blocked/.test(raw)) return 'unavailable';
      return 'idle';
    }
    build(asset = {}) {
      const id = String(firstDefined(asset.asset_id, asset.flexible_asset_id, asset.target_asset_id, ''));
      const planning = this.planningFor(id);
      const participation = this.participationState(asset, planning);
      return {
        id,
        raw: asset,
        planning,
        participation,
        operation: this.operationalState(asset, planning),
        isStorage: participation === 'storage',
        isDisabled: participation === 'disabled',
        isParticipating: participation === 'participating' || participation === 'temporarily_unavailable',
        isTemporarilyUnavailable: participation === 'temporarily_unavailable'
      };
    }
    all() {
      if (!this._all) {
        this._all = this.runtime.primaryFlexibleAssets().map(asset => this.build(asset));
        this._byId = new Map(this._all.map(vm => [vm.id, vm]));
      }
      return this._all;
    }
    byId(assetId) { this.all(); return this._byId.get(String(assetId)) || null; }
    participating() { return this.all().filter(vm => vm.isParticipating && !vm.isStorage); }
    disabled() { return this.all().filter(vm => vm.isDisabled); }
    storage() { return this.all().filter(vm => vm.isStorage); }
    planningRows() {
      const published = new Map(this.runtime.planningIndexRows().map(row => [String(row.asset_id || row.consumer_id || row.id || ''), row]));
      return this.participating().map(vm => {
        const row = published.get(vm.id) || vm.planning || {};
        return {
          ...row,
          asset_id: vm.id,
          participation_state: vm.participation,
          operational_state: vm.operation,
          status: vm.operation,
          state: vm.operation,
          waiting: vm.operation === 'waiting',
          planned: vm.operation === 'planned',
          active: vm.operation === 'active',
          paused: vm.operation === 'paused'
        };
      });
    }
    summary() {
      const rows = this.planningRows();
      return {
        participating_count: rows.length,
        disabled_count: this.disabled().length,
        storage_count: this.storage().length,
        waiting_count: rows.filter(row => row.operational_state === 'waiting').length,
        planned_count: rows.filter(row => row.operational_state === 'planned').length,
        active_count: rows.filter(row => row.operational_state === 'active').length,
        paused_count: rows.filter(row => row.operational_state === 'paused').length,
        temporarily_unavailable_count: rows.filter(row => row.participation_state === 'temporarily_unavailable').length
      };
    }
    physicalFlowParticipants() {
      const relationships = this.runtime.connectedRelationships();
      const related = new Set();
      relationships.forEach(rel => {
        if (rel.from_asset_id) related.add(String(rel.from_asset_id));
        if (rel.to_asset_id) related.add(String(rel.to_asset_id));
      });
      return this.participating().filter(vm => {
        const asset = vm.raw || {};
        const measured = asNumber(firstDefined(asset.current_power_kw, asset.actual_power_kw, asset.power_kw, this.runtime.number(`${vm.id}.current_power_kw`), this.runtime.number(`${vm.id}.power_kw`))) || 0;
        const connected = asBool(firstDefined(asset.connected, asset.connection_state === 'connected', this.runtime.value(`${vm.id}.connected`, false)), false);
        const charger = firstDefined(asset.effective_charger, asset.charger_asset_id, asset.connection_asset_id, asset.execution_target_asset_id, '');
        return measured > 0.05 || connected || related.has(vm.id) || (charger && related.has(String(charger)));
      });
    }
  }