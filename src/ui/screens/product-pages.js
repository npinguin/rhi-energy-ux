// Energy product screens. Presentation only; domain truth stays in runtime/projections.
const RHI_ENERGY_PRODUCT_PAGE_METHODS = Object.freeze({
overview(rt) {
    const pageVm = this.buildPageViewModel(rt, 'overview');
    const compatibility = rt.contractCompatibility();
    if (!compatibility.available && compatibility.reason) {
      return `${this.tabExperienceHeader(rt,'overview',pageVm)}
        <section class="panel energyUnavailableState">
          ${rhiUxState({state:'unavailable',title:rhiEnergyT(this._hass,'common.not_available',{},'Not available'),detail:rhiEnergyT(this._hass,'common.information_missing',{},'This information is not available yet.')})}
        </section>`;
    }
    const d = rt.decision();
    const balanceVm = this.canonicalLiveEnergyBalance(rt);
    const batterySoc = balanceVm.battery.socPct;
    const reasonRaw = firstDefined(objectFrom(d.reason || {}).message, d.reason_label, rt.rawText('energy_intelligence.reason', null));
    const reasonCandidate = reasonRaw ? humanReason(reasonRaw, '') : '';
    const reason = /residual|reconciliation|canonical|bucket|projection|not.?published|completed|unsustainable/i.test(reasonCandidate)
      ? 'Current production, demand and grid exchange are being monitored against the active strategy.'
      : (reasonCandidate || 'Current production, demand and grid exchange are being monitored against the active strategy.');
    const solarRemaining = rt.number('forecast.solar_remaining_today_kwh');
    const reservePct = this.batteryReservePct(rt);
    const sourceRows = [];
    if (balanceVm.solarKw !== null && balanceVm.solarKw > 0.05) sourceRows.push(this.overviewEnergyRow({icon:'☀',label:'Solar',subtitle:'Producing now',value:fmtKw(balanceVm.solarKw),progress:this.progress(balanceVm.solarKw)}));
    if (balanceVm.battery.direction === 'out_of_storage' && balanceVm.battery.displayPowerKw !== null) sourceRows.push(this.overviewEnergyRow({icon:'▣',label:'Home Battery',subtitle:balanceVm.battery.label,value:fmtKw(balanceVm.battery.displayPowerKw),progress:this.progress(balanceVm.battery.displayPowerKw)}));
    if (balanceVm.gridImportKw !== null && balanceVm.gridImportKw > 0.05) sourceRows.push(this.overviewEnergyRow({icon:'⚡',label:'Grid Import',subtitle:'Importing',value:fmtKw(balanceVm.gridImportKw),progress:this.progress(balanceVm.gridImportKw)}));
    const contributors = balanceVm.flexible.filter(row => row.powerKw !== null && row.powerKw > 0.05);
    const contributorRows = contributors.map(row => this.overviewEnergyRow({icon:this.flexibleAssetIcon(row.raw || {display_name:row.name}),asset:row.raw || null,label:row.name,subtitle:'Flexible Load contributor',value:fmtKw(row.powerKw,'—'),variant:'child'})).join('');
    const siteConsumptionText = fmtKw(balanceVm.siteConsumptionKw,'—');
    const homeConsumptionSubtitle = balanceVm.homeConsumptionKw === null
      ? (String(balanceVm.homeStatus || '').toUpperCase() === 'INCOMPLETE' ? 'Unavailable · Flexible Load power incomplete' : 'Household consumption unavailable')
      : 'Household consumption excluding Flexible Loads';
    const flexibleLoadsSubtitle = balanceVm.flexibleLoadsKw === null
      ? (String(balanceVm.flexibleStatus || '').toUpperCase() === 'INCOMPLETE' ? 'Measurement incomplete' : 'Measurement unavailable')
      : `${contributors.length} active contributor${contributors.length===1?'':'s'}`;
    const gridDirection = balanceVm.grid.label;
    const gridValue = balanceVm.grid.displayPowerKw;
    const recommendation = String(firstDefined(d.what_text, d.recommendation_text, d.recommendation, d.summary, 'Monitoring current energy flow') || 'Monitoring current energy flow');
    return `${this.tabExperienceHeader(rt,'overview',pageVm)}
      <div class="overviewCoreGrid">
        <section class="panel overviewCorePanel"><div class="overviewSectionTitle"><span class="overviewSectionIcon orange">☀</span><div><h2>Production & supply</h2><p>Energy available to the home now.</p></div></div>${sourceRows.join('') || `<div class="empty compact"><b>Supply unavailable</b><span>Current supply cannot be determined from canonical measurements.</span></div>`}</section>
        <section class="panel overviewDecisionPanel overviewHouseHero"><div class="overviewHouseHeroImage"></div><div class="overviewDecisionOverlay"><span class="overviewDecisionLabel">HOME INTELLIGENCE</span><h2>${escapeHtml(recommendation)}</h2><p>${escapeHtml(reason)}</p><div class="overviewDecisionFacts"><div><small>Site Consumption</small><b>${siteConsumptionText}</b></div><div><small>Grid</small><b>${escapeHtml(fmtKw(gridValue,'—'))} ${escapeHtml(gridDirection)}</b></div>${rt.experiencePresence().battery === true ? `<div><small>Battery</small><b>${escapeHtml(fmtPct(batterySoc))}</b></div>` : ''}</div></div></section>
        <section class="panel overviewCorePanel"><div class="overviewSectionTitle"><span class="overviewSectionIcon blue">⌂</span><div><h2>Consumption</h2><p>Site demand and its active components.</p></div></div>${this.overviewEnergyRow({icon:'⌂',label:'Home Consumption',subtitle:homeConsumptionSubtitle,value:fmtKw(balanceVm.homeConsumptionKw,'—'),progress:this.progress(balanceVm.homeConsumptionKw)})}${rt.experiencePresence().flexible_loads === true ? this.overviewEnergyRow({icon:'⚡',label:'Flexible Loads',subtitle:flexibleLoadsSubtitle,value:fmtKw(balanceVm.flexibleLoadsKw,'—'),variant:'aggregate'}) : ''}${contributorRows}${rt.experiencePresence().battery === true && balanceVm.battery.direction === 'into_storage' && balanceVm.battery.displayPowerKw !== null ? this.overviewEnergyRow({icon:'▣',label:'Home Battery',subtitle:balanceVm.battery.label,value:fmtKw(balanceVm.battery.displayPowerKw),progress:this.progress(balanceVm.battery.displayPowerKw)}) : ''}${this.overviewEnergyRow({icon:'',label:'Site Consumption',subtitle:'Total current site demand',value:siteConsumptionText,variant:'total'})}${this.overviewEnergyRow({icon:'',label:gridDirection === 'Exporting' ? 'Grid Export' : gridDirection === 'Importing' ? 'Grid Import' : 'Grid',subtitle:'Grid boundary',value:fmtKw(gridValue,'—'),variant:'boundary'})}</section>
      </div>
      ${this.overviewExperiencePanel(rt)}`;
  },

flow(rt) {
    const pageVm = this.buildPageViewModel(rt, 'flow');
    const current = this.currentEnergyModel(rt);
    const solar = current.solar.powerKw;
    const gridImport = current.grid.importPowerKw;
    const gridExport = current.grid.exportPowerKw;
    const battery = current.battery;
    const connectionSnapshot = this.canonicalConnectionSnapshot(rt);
    const rawConsumers = this.flowConsumers(rt, connectionSnapshot);
    const rawChargers = connectionSnapshot.rows;
    const physicalFlow = buildPhysicalFlowViewModel(rt, rt.contractGateway(), rawConsumers, rawChargers, connectionSnapshot);
    const siteConsumption = physicalFlow.siteConsumptionKw;
    const homeConsumption = physicalFlow.homeConsumptionKw;
    const flexibleLoadsPower = physicalFlow.flexibleLoadsKw;
    const consumers = physicalFlow.consumers;
    const chargers = physicalFlow.connections;
    const connectionPower = physicalFlow.connectionPowerKw;
    const homeBus = rt.asset('home_bus') || { display_name: 'Home Bus' };
    const switchboard = rt.asset('main_switchboard') || { display_name: 'Main Switchboard' };
    return `${this.tabExperienceHeader(rt,'flow',pageVm)}<div class="flowPage">
      <section class="panel physicalFlowHero">
        <div class="flowHeader"><div><h2>Physical Energy Flow</h2><p>Live measured energy paths only. Disabled and planning-only assets are excluded.</p></div></div>
        <div class="flowCanvas">
          <div class="flowColumn producers">
            <h3>Producers</h3>
            ${this.flowNode('☀','Solar',fmtKw(solar,'0.0 kW'),'solar → home bus','solarNode')}
            ${this.flowNode('▣','Home Battery',fmtKw(battery.displayPowerKw,'—'),battery.detail,'batteryNode')}
            ${this.flowNode('⚡','Grid import',fmtKw(gridImport,'—'),'grid import → home bus','gridNode')}
          </div>
          <div class="flowCenter">
            <div class="busStack">
              <div class="switchboardNode"><span>Main Switchboard</span><b>${escapeHtml(switchboard.display_name || 'Main Switchboard')}</b></div>
              <div class="homeBusNode"><span>Physical bus</span><b>${escapeHtml(homeBus.display_name || 'Home Bus')}</b><small>${escapeHtml(fmtKw(siteConsumption,'—'))} Site Consumption</small></div>
            </div>
            <div class="flowLines">
              ${this.flowLine('Solar feed', fmtKw(solar,'—'), 'solar')}
              ${this.flowLine('Battery feed / charge', fmtKw(battery.signedFlowKw,'—'), 'battery')}
              ${this.flowLine('Grid import', fmtKw(gridImport,'—'), 'grid')}
              ${this.flowLine('Grid export', fmtKw(gridExport,'—'), 'export')}
            </div>
          </div>
          <div class="flowColumn sinks">
            <h3>Consumers</h3>
            ${this.flowNode('⌂','Home Consumption',fmtKw(homeConsumption,'—'),'household consumption excluding Flexible Loads','homeNode')}
            ${this.flowNode('🚘','Flexible Loads',fmtKw(flexibleLoadsPower,'—'),`${consumers.length} managed consumer${consumers.length === 1 ? '' : 's'}`,'consumerNode')}
          </div>
        </div>
      </section>
      <div class="flowDetailsGrid flowDetailsGridTwoUp">
        <section class="panel"><h2>Charging connections</h2><p>Chargers and vehicle assignments currently visible to Energy.</p>${chargers.map(charger => this.connectorCard(rt, charger)).join('') || `<div class="empty"><b>${connectionSnapshot.available ? 'No charging topology published' : 'Connection data unavailable'}</b><span>${connectionSnapshot.available ? 'No charger or charger assignment is currently published.' : 'The canonical connection snapshot is not available.'}</span></div>`}</section>
        <section class="panel"><h2>Physical consumers</h2><p>Participating loads with a published physical relationship; idle assets remain visible.</p>${consumers.map(consumer => this.consumerCard(rt, consumer)).join('') || `<div class="empty"><b>No flexible consumers available</b><span>No controllable loads are currently available.</span></div>`}</section>
      </div>
    </div>`;
  },

solar(rt) {
    const pageVm = this.buildPageViewModel(rt, 'solar');
    const solarPower = rt.number('solar.power_kw');
    const forecastToday = rt.number('forecast.solar_today_kwh');
    const solarToday = rt.number('metering.solar_energy_today_kwh') ?? rt.number('solar.energy_today_kwh');
    const solarRemaining = rt.number('forecast.solar_remaining_today_kwh');
    const gridExportToday = rt.number('metering.grid_export_today_kwh');
    return `${this.tabExperienceHeader(rt,'solar',pageVm)}<div class="solarPage solarHardwarePage">
      ${this.solarEnergyStory(rt)}
      ${this.solarHardwareExperience(rt)}
    </div>`;
  },

battery(rt) {
    const pageVm = this.buildPageViewModel(rt, 'battery');
    const batteryVm = this.currentEnergyModel(rt).battery;
    const soc = batteryVm.socPct;
    const capacity = batteryVm.capacityKwh;
    const available = batteryVm.availableKwh;
    const power = batteryVm.displayPowerKw;
    const state = batteryVm.label;
    const reserve = asNumber(firstDefined(
      rt.value('battery.reserve_target_pct', null),
      rt.value('battery.reserve_pct', null)
    ));
    const batterySystem = rt.assets().find(asset => ['battery_system','home_battery_system'].includes(String(asset.asset_type || asset.object_class || '').toLowerCase())) || rt.asset('battery_system');
    const children = batterySystem
      ? rt.childrenOfType(String(batterySystem.asset_id || 'battery_system'), 'battery')
      : rt.assets().filter(asset => String(asset.asset_type || asset.object_class || '').toLowerCase() === 'battery').map(asset => String(asset.asset_id || '')).filter(Boolean);
    const systemDetails = batterySystem ? this.energyAssetDetailDisclosure(rt,this.energyAssetContext(rt,batterySystem)) : '';
    return `${this.tabExperienceHeader(rt,'battery',pageVm)}<div class="batteryPage">
      <div class="batteryGrid batteryGridTwoUp">
        <section class="panel batteryHero"><h2>Home Battery state</h2><p>Combined operational truth for the Home Battery system.</p><div class="batteryGauge"><b>${escapeHtml(fmtPct(soc))}</b><span>${escapeHtml(fmtKwh(available))} / ${escapeHtml(fmtKwh(capacity))}</span><div class="bar"><i style="width:${escapeHtml(this.progress(soc,100))}%"></i></div></div>${this.kv('State', human(state))}${this.kv('Power now', fmtKw(power,'—'))}${this.kv('Available energy', fmtKwh(available))}${this.kv('Capacity', fmtKwh(capacity))}${reserve === null ? '' : this.kv('Reserve',fmtPct(reserve))}${this.kv('Health', human(batteryVm.health))}${systemDetails}</section>
        <section class="panel" id="battery-contributors"><h2>Home Battery contributors</h2><p>Physical batteries contributing to the aggregate.</p><div class="batteryContributorList">${children.map(id => this.batteryChildCard(rt, id)).join('') || `<div class="empty"><b>No Home Battery units published</b><span>Home Battery aggregate only.</span></div>`}</div></section>
      </div>
    </div>`;
  },

consumers(rt) {
    const pageVm = this.buildPageViewModel(rt, 'consumers');
    const publishedRows = rt.consumerMixRows();
    const summary = rt.consumerMixSummary();
    const domain = this.flexibleAssetDomain(rt);
    const publishedById = new Map(publishedRows.map(row => [String(row.asset_id||row.consumer_id||row.id||''), row]));
    const canonicalRows = domain.consumerFacing().map(vm => {
      const raw = vm.raw || {};
      const published = publishedById.get(vm.id) || {};
      return {
        ...raw,
        ...published,
        asset_id:vm.id,
        visual_ref:firstDefined(vm.visualRef, raw.visual_ref, published.visual_ref, ''),
        charger_asset_id:firstDefined(raw.charger_asset_id, raw.effective_charger, raw.connection_asset_id, published.charger_asset_id, published.effective_charger, published.connection_asset_id, ''),
        connection_state:firstDefined(raw.connection_state, published.connection_state, ''),
        participation_state:vm.participation,
        operational_state:vm.operation
      };
    });
    const canonicalIds = new Set(canonicalRows.map(row => String(row.asset_id||row.consumer_id||row.id||'')));
    const rows = canonicalRows.concat(publishedRows.filter(row => {
      const id = String(row.asset_id||row.consumer_id||row.id||'');
      if (canonicalIds.has(id)) return false;
      const vm = domain.byId(id);
      if (vm) return !vm.isInfrastructure && !vm.isStorage;
      const kind = String(firstDefined(row.source_asset_kind,row.asset_type,row.object_class,row.energy_asset_role,'') || '').toLowerCase();
      return !/(^|_)(charger|connection|charging_point)(_|$)/.test(kind);
    }));
    const visibleRows = this.filterAndSortConsumers(rows);
    const participating = visibleRows.filter(row => { const vm=domain.byId(row.asset_id||row.consumer_id||row.id); return !vm || (vm.isParticipating && !vm.isDisabled); });
    const disabled = visibleRows.filter(row => domain.byId(row.asset_id||row.consumer_id||row.id)?.isDisabled);
    const totalPower = asNumber(summary.current_power_kw);
    const cards = participating.map(row=>this.consumerExplorerCard(rt,row)).join('');
    const disabledRows = disabled.map(row=>{ const vm=domain.byId(row.asset_id||row.consumer_id||row.id); return this.disabledFlexibleAssetCard(rt,vm?.raw||row,vm?.planning||{}); }).join('');
    return `${this.tabExperienceHeader(rt,'consumers',pageVm)}${this.bodyContextBar(rt,'consumers','consumer-list')}<div class="consumersPage productPortalPage">
      <section class="panel consumerExplorer" id="consumer-list"><div class="consumerExplorerHeader"><div><h2>Managed flexible assets</h2><p>Primary cards show current power and published energy need. Details hold the deeper technical context.</p></div><strong>${fmtKw(totalPower,'—')}</strong></div><div class="consumerExplorerList">${cards || `<div class="empty"><b>No managed assets</b><span>Enable participation for an asset to let Home Intelligence manage it.</span></div>`}</div></section>
      ${disabledRows ? `<details class="panel compactDisclosure"><summary>Other assets (${disabled.length})</summary><p>These assets are not managed by Home Intelligence.</p><div class="disabledAssetList">${disabledRows}</div></details>` : ''}
    </div>`;
  },

gas(rt) {
    const pageVm = this.buildPageViewModel(rt, 'gas');
    const gas = this.gasModel(rt);
    const hasMeter = !!gas.asset;
    const meter = hasMeter ? this.energyDeviceStatusCard(rt, gas.asset, 'Gas meter') : '';
    const historyAvailable = !!gas.totalEntityId;
    const gasHorizons = [['week','Week'],['month','Month'],['quarter','Quarter'],['year','Year']];
    const gasHorizonLabel = gasHorizons.find(([id])=>id===this.selectedGasHorizonId)?.[1] || 'Month';
    const gasHorizonSelector = `<div class="scopeSelector gasHorizonSelector" aria-label="Gas history horizon">${gasHorizons.map(([id,label])=>`<button type="button" class="scopeOption ${this.selectedGasHorizonId===id?'active':''}" data-gas-horizon="${id}">${label}</button>`).join('')}</div>`;
    const graph = historyAvailable
      ? `<section class="panel gasHistoryPanel" id="gas-history"><div class="rhiUxSectionHead"><div><h2>Gas usage history</h2><p>Daily measured gas use from Home Assistant long-term statistics on the canonical total-increasing meter.</p></div><div class="gasHistoryControls"><span>${escapeHtml(gasHorizonLabel)}</span>${gasHorizonSelector}</div></div><div class="gasStatisticsHost" data-gas-statistics-host data-entity-id="${escapeHtml(gas.totalEntityId)}"></div></section>`
      : `<section class="panel gasHistoryPanel" id="gas-history"><div class="rhiUxSectionHead"><div><h2>Gas usage history</h2><p>Daily gas consumption will appear here when a canonical total-increasing gas meter is available.</p></div></div><div class="empty"><b>No measured gas history yet</b><span>Connect the authoritative gas meter to enable Home Assistant long-term statistics. The UX never estimates missing consumption.</span></div></section>`;
    const setupOrMeter = hasMeter
      ? `<section class="panel gasMeterPanel" id="gas-meter"><div class="rhiUxSectionHead"><div><h2>Gas meter</h2><p>Current meter state and measured values.</p></div></div>${meter}</section>`
      : `<section class="panel gasSetupPanel" id="gas-meter"><div class="rhiUxSectionHead"><div><h2>Connect your gas meter</h2><p>RHI Energy needs one authoritative gas source before it can show consumption history.</p></div></div><div class="gasSetupFacts"><div><small>Required</small><b>Total gas meter</b><span>A cumulative total-increasing reading in m³.</span></div><div><small>Optional</small><b>Live gas flow</b><span>An instantaneous m³/h reading when the source publishes it.</span></div><div><small>History</small><b>Home Assistant statistics</b><span>Daily changes are shown without frontend estimation.</span></div></div></section>`;
    return `${this.tabExperienceHeader(rt,'gas',pageVm)}<div class="gasPage">
      ${setupOrMeter}
      ${graph}
    </div>`;
  }
});
