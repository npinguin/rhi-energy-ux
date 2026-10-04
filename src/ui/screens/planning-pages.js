// Energy planning screens. Presentation only; planning truth stays backend-owned.
const RHI_ENERGY_PLANNING_PAGE_METHODS = Object.freeze({
operationalPlanning(rt) {
    const pageVm = this.buildPageViewModel(rt, 'operational-planning');
    const d = rt.decision();
    const recommendation = firstDefined(d.recommendation, d.advice, rt.rawText('energy_intelligence.recommendation', null), 'Observe');
    const targetId = firstDefined(d.recommended_target_asset_id, rt.value('energy_intelligence.recommended_target_asset_id', null), '');
    const assetDomain = this.flexibleAssetDomain(rt);
    const loads = assetDomain.consumerFacing().map(vm => vm.raw);
    const participating = loads.filter(load => !assetDomain.byId(load.asset_id)?.isDisabled);
    const disabled = loads.filter(load => assetDomain.byId(load.asset_id)?.isDisabled);
    const cards = participating.map(load => this.operationalLoadCard(rt, load, recommendation, targetId)).join('');
    const disabledCards = disabled.map(load => this.disabledFlexibleAssetCard(rt, load, load.energy_planning || rt.planningOutcomeFor(load.asset_id) || {})).join('');
    const active = participating.filter(load => (asNumber(load.power_kw) || 0) > 0.05 || /running|charging|executing/i.test(String(load.operating_state || load.current_status || ''))).length;
    const planned = participating.filter(load => {
      const p = load.energy_planning || rt.planningOutcomeFor(load.asset_id) || {};
      return /planned|scheduled|expected today|done today/i.test(String(firstDefined(p.state,p.status,p.today_status,p.expected,'')));
    }).length;
    const waiting = participating.filter(load => {
      const p = load.energy_planning || rt.planningOutcomeFor(load.asset_id) || {};
      return /waiting|blocked|uncertain|not eligible/i.test(String(firstDefined(p.state,p.status,p.today_status,p.expected,'')));
    }).length;
    const executionPolicy = this.automationExecutionPolicy(rt);
    const executePlan = rt.commands().find(command => rt.commandRole(command) === 'execute_plan') || null;
    const policyTitle = executionPolicy.configuredMode === 'automatic'
      ? 'Automatic · Home Intelligence may execute the current plan'
      : executionPolicy.configuredMode === 'advice'
        ? 'Advice · plan waits for your approval'
        : 'Disabled · planning is informational only';
    const policyWhy = executionPolicy.configuredMode === 'automatic'
      ? 'Only the current canonical D0 allocation may be dispatched, with producer readiness and authoritative readback still required.'
      : executionPolicy.configuredMode === 'advice'
        ? 'Home Intelligence calculates the same plan but cannot dispatch it autonomously.'
        : 'Home Intelligence keeps calculating planning insight but managed plan execution is blocked.';
    const executeAction = executePlan && rt.commandVisible(executePlan)
      ? this.componentActionButton(executePlan, executePlan.label || (executionPolicy.configuredMode === 'advice' ? 'Apply current plan' : 'Run current plan now'), 'energy')
      : '';
    const authorityCard = this.productStoryCard({
      eyebrow:'Automation authority',
      title:policyTitle,
      why:policyWhy,
      recommendation:executionPolicy.configuredMode === 'advice'
        ? 'Review the plan and apply it when you agree.'
        : executionPolicy.configuredMode === 'automatic'
          ? 'Home Intelligence manages the current plan within your configured strategies.'
          : 'Change Automation mode to Advice or Automatic to allow managed plan execution.',
      actions:executeAction,
      tone:executionPolicy.configuredMode === 'automatic' ? 'green' : executionPolicy.configuredMode === 'advice' ? 'blue' : 'orange'
    });
    return `${this.tabExperienceHeader(rt,'operational-planning',pageVm)}<div class="operationalPlanningPage">${authorityCard}
      <section class="panel operationalPlanningLoads"><div class="energySectionHead"><div><h2>Flexible loads</h2><p>Current execution, next action, requested power and operational reason. Hardware configuration is not shown here.</p></div></div><div class="flexLoadList">${cards || '<div class="empty"><b>No participating flexible loads</b><span>No controllable load currently participates in operational planning.</span></div>'}</div></section>
      ${disabledCards ? `<details class="panel compactDisclosure"><summary>Other assets (${disabled.length})</summary><p>These assets are excluded from operational planning.</p><div class="disabledAssetList">${disabledCards}</div></details>` : ''}
    </div>`;
  },

planning(rt) {
    const vm = this.buildPlanningViewModel(rt);
    const horizonLabel = vm.horizonId === 'D1' ? 'Tomorrow' : 'Today';
    const assetKey = asset => String(asset.asset_id || asset.id || '');
    const totals = vm.laneTotals;
    const canonicalAssetsById = vm.planningAssetsById || {};
    const assetTotalsById = totals.flexibleAssetsById;
    const plannedForAsset = assetId => {
      const raw = assetTotalsById[assetId];
      if (raw === undefined || raw === null) return null;
      if (typeof raw === 'number') return asNumber(raw);
      const row = objectFrom(raw);
      return asNumber(firstDefined(row.energy_kwh, row.planned_energy_kwh, row.total_kwh, row.value));
    };
    const allAssetTotals = vm.assets.map(asset => {
      const canonical = objectFrom(canonicalAssetsById[assetKey(asset)] || vm.planningAssets.find(row => String(row.asset_id || '') === assetKey(asset)) || {});
      const published = objectFrom(assetTotalsById[assetKey(asset)]);
      return {
        asset,
        canonical,
        need: asNumber(firstDefined(canonical.need_kwh,published.energy_need_kwh,published.need_kwh,published.remaining_need_kwh)),
        plannedEnergy: vm.horizonId === 'D1' ? asNumber(canonical.planned_tomorrow_kwh) : asNumber(canonical.planned_today_kwh),
        remainingNeed: asNumber(firstDefined(canonical.unresolved_horizon_kwh,published.remaining_need_kwh,published.unresolved_need_kwh))
      };
    });
    const hourlyAssetEnergy = assetId => vm.rows.reduce((sum,row) => {
      const value = this.planningParticipant(row,'consumers',assetId)?.energyKwh;
      return sum + (value === null || value === undefined ? 0 : Math.max(0,Number(value) || 0));
    }, 0);
    // Tactical Planning shows every real planning participant. Zero/no-plan is
    // a valid state and must not make a vehicle disappear from the horizon.
    const assetTotals = allAssetTotals;

    const solarTotal = totals.solarKwh;
    const batteryOutTotal = totals.homeBatteryOutKwh;
    const gridInTotal = totals.gridInKwh;
    const homeTotal = totals.homeKwh;
    const flexibleLoadsTotal = totals.flexibleLoadsKwh;
    const batteryInTotal = totals.homeBatteryInKwh;
    const gridOutTotal = totals.gridOutKwh;
    const sourceTotal = totals.sourceTotalKwh;
    const useTotal = totals.useTotalKwh;
    const balanceDelta = totals.balanceDeltaKwh;
    const batteryNeed = totals.homeBatteryNeedKwh;
    const showLane = value => value === null || Math.abs(value) > 0.001;
    const systemLanes = [
      {id:'solar',group:'sources',label:'Solar',icon:'☀',tone:'orange',total:solarTotal,participantLane:'sources',participantId:'solar'},
      {id:'batteryOut',group:'sources',label:'Home Battery out',icon:'▣',tone:'green',total:batteryOutTotal,participantLane:'sources',participantId:'battery'},
      {id:'gridIn',group:'sources',label:'Grid in',icon:'↘',tone:'slate',total:gridInTotal,participantLane:'sources',participantId:'grid',signed:true},
      {id:'home',group:'consumers',label:'Home',icon:'⌂',tone:'blue',total:homeTotal,participantLane:'consumers',participantId:'home'},
      {id:'batteryIn',group:'consumers',label:'Home Battery in',icon:'▣',tone:'green',total:batteryInTotal,participantLane:'consumers',participantId:'battery',advisory:true},
      // Grid out is the fixed boundary lane and must remain the final column.
      // Flexible Loads is not a system lane: individual flexible assets are rendered as columns.
      {id:'gridOut',group:'boundary',label:'Grid out',icon:'↗',tone:'slate',total:gridOutTotal,boundary:true,alwaysVisible:true}
    ].filter(lane => lane.alwaysVisible || showLane(lane.total));

    const sourceLaneCount = systemLanes.filter(l => l.group === 'sources').length;
    const consumerLaneCount = systemLanes.filter(l => l.group === 'consumers').length + assetTotals.length;
    const boundaryLaneCount = systemLanes.filter(l => l.group === 'boundary').length;
    const systemHeaders = systemLanes.filter(l => l.group !== 'boundary').map(lane => `<th><span class="planningColumnHead">${this.planningIconBadge(lane.icon,lane.tone,'system')}<b>${escapeHtml(lane.label)}</b><small>kWh</small></span></th>`).join('');
    const assetHeaders = assetTotals.map(item => `<th><span class="planningAssetHead">${this.assetVisual(item.asset,{size:'xs',fallbackIcon:this.planningAssetIcon(item.asset)})}<span><b>${escapeHtml(this.planningAssetName(item.asset))}</b><small class="planningHeaderNeed">${item.need===null?'Need —':`Need ${item.need.toFixed(1)} kWh`}</small></span></span><small class="planningUnit">kWh</small></th>`).join('');
    const boundaryHeaders = systemLanes.filter(l => l.group === 'boundary').map(lane => `<th><span class="planningColumnHead">${this.planningIconBadge(lane.icon,lane.tone,'system')}<b>${escapeHtml(lane.label)}</b><small>kWh</small></span></th>`).join('');
    const laneCell = (row,lane) => {
      if (lane.aggregateOnly) {
        const value = row.consumers.filter(item => assetTotals.some(a => assetKey(a.asset) === String(item.participantId))).reduce((sum,item) => sum + (item.energyKwh || 0),0);
        return value <= 0.001 ? '' : value.toFixed(1);
      }
      if (lane.boundary) {
        const value = row.boundary.gridExportKwh;
        return value === null ? '<span class="planningUnavailable">—</span>' : (value <= 0.001 ? '' : `<span class="planningExport">${value.toFixed(1)}</span>`);
      }
      const participant = this.planningParticipant(row,lane.participantLane,lane.participantId);
      if (!participant || participant.energyKwh === null) return '<span class="planningUnavailable">—</span>';
      return participant.energyKwh <= 0.001 ? '' : `<span class="planningPowerValue ${lane.signed?'planningImport':''}">${participant.energyKwh.toFixed(1)}</span>`;
    };
    const rows = vm.rows.map(row => {
      const current = vm.horizonId === 'D0' && row.id === vm.currentBucketId;
      const fixedCells = systemLanes.filter(l => l.group !== 'boundary').map(lane => `<td>${laneCell(row,lane)}</td>`).join('');
      const assetCells = assetTotals.map(item => `<td>${laneCell(row,{participantLane:'consumers',participantId:assetKey(item.asset)})}</td>`).join('');
      const boundaryCells = systemLanes.filter(l => l.group === 'boundary').map(lane => `<td>${laneCell(row,lane)}</td>`).join('');
      return `<tr class="${current?'planningCurrent':''}"><td><span class="planningTime">${current?'<em>NOW</em>':''}${escapeHtml(this.planningTimeLabel(row.startTime))}</span></td>${fixedCells}${assetCells}${boundaryCells}</tr>`;
    }).join('');
    const totalCell = (value,small='Planning total',{showZero=false}={}) => `<td><b>${value===null?'—':(Math.abs(value) <= 0.001 ? (showZero?'0.0 kWh':'') : value.toFixed(1)+' kWh')}</b><small>${value!==null && Math.abs(value) <= 0.001 && !showZero ? '' : escapeHtml(small)}</small></td>`;
    const fixedTotalCells = systemLanes.filter(l => l.group !== 'boundary').map(lane => totalCell(lane.total,lane.id==='batteryIn'&&batteryNeed!==null?`${batteryNeed.toFixed(1)} kWh target need`:'Planning total')).join('');
    const assetTotalCells = assetTotals.map(item => `<td class="planningTotalAsset"><b>${item.plannedEnergy===null?'—':item.plannedEnergy.toFixed(1)+' kWh'}</b><small>${item.need===null?'Need unavailable':`of ${item.need.toFixed(1)} kWh needed`}</small></td>`).join('');
    const boundaryTotalCells = systemLanes.filter(l => l.group === 'boundary').map(lane => totalCell(lane.total,'Planning total',{showZero:true})).join('');

    const canonicalTotals = vm.horizonId === 'D0'
      ? objectFrom(vm.todayTotals)
      : objectFrom(vm.tomorrowTotals);
    const totalNeed = asNumber(canonicalTotals.flexible_required_kwh);
    const totalPlanned = asNumber(canonicalTotals.flexible_planned_kwh);
    const remainingNeed = asNumber(canonicalTotals.flexible_still_to_plan_kwh);
    const displayNeed = vm.complete ? totalNeed : null;
    const displayPlanned = vm.complete ? totalPlanned : null;
    const displayRemaining = vm.complete ? remainingNeed : null;
    const planStatus = String(firstDefined(vm.currentActionIntent.action_state, vm.currentActionIntent.state, vm.summary.plan_status, vm.horizon.status, vm.horizon.state, vm.complete?'available':'unavailable'));
    const confidence = firstDefined(vm.quality.confidence, vm.horizon.confidence, 'Limited');
    const statusLabel = /at.?risk/i.test(planStatus) ? 'At risk' : this.productStateLabel(planStatus, vm.complete?'Forecast plan':'Plan unavailable');
    const plannedTotals = assetTotals.map(item => `<span class="planningFooterAsset">${this.assetVisual(item.asset,{size:'xs',fallbackIcon:this.planningAssetIcon(item.asset)})}<b>${escapeHtml(this.planningAssetName(item.asset))}</b> ${item.plannedEnergy===null?'—':item.plannedEnergy.toFixed(1)+' kWh'}</span>`).join('');
    const summaryItems = vm.horizonId === 'D1'
      ? [['Need entering tomorrow',displayNeed],['Planned tomorrow',displayPlanned],['Still after tomorrow',displayRemaining]]
      : [['Need entering today',displayNeed],['Planned today',displayPlanned],['Still after today',displayRemaining]];
    const summaryTotals = `<div class="planningAggregateTotals">${summaryItems.map(([label,value])=>`<span><small>${label}</small><b>${value===null?'—':value.toFixed(1)+' kWh'}</b></span>`).join('')}</div>`;
    const disclosure = firstDefined(vm.rows.find(row=>row.disclosure)?.disclosure, vm.quality.basis ? `Planning basis: ${human(vm.quality.basis)}. Actual execution follows the current operational intent.` : 'Future buckets are advisory. Actual execution follows the current operational intent.');
    const balanceLabel = sourceTotal===null || useTotal===null ? 'Planning balance unavailable' : `${sourceTotal.toFixed(1)} kWh source · ${useTotal.toFixed(1)} kWh use${balanceDelta===null?'':` · Δ ${balanceDelta.toFixed(3)} kWh`}`;
    const heroValue = displayPlanned===null ? '—' : displayPlanned.toFixed(1)+' kWh';
    const planningHeader = {
      image:hbEnergyHeroAsset('solar-generation'),
      icon:'▣',
      eyebrow:'Tactical planning',
      title:`${horizonLabel} plan`,
      value:heroValue,
      unit:displayNeed===null?'planned flexible energy':`of ${displayNeed.toFixed(1)} kWh flexible need`,
      explanation:displayRemaining===null?'Remaining need is unavailable.':`${displayRemaining.toFixed(1)} kWh still needs a suitable opportunity.`,
      tone:'purple',
      badgeText:vm.contractSupported ? statusLabel : 'Unavailable',
      badgeTone:vm.contractSupported && vm.complete ? 'ok' : 'attention',
      metrics:[
        ['◎',vm.horizonId === 'D1' ? 'Need entering tomorrow' : 'Need entering today',fmtKwh(displayNeed,'—'),horizonLabel],
        ['▣',vm.horizonId === 'D1' ? 'Planned tomorrow' : 'Planned today',fmtKwh(displayPlanned,'—'),horizonLabel],
        ['◷',vm.horizonId === 'D1' ? 'Still after tomorrow' : 'Still after today',fmtKwh(displayRemaining,'—'),'Horizon-local residual'],
        ['✓','Confidence',this.productStateLabel(confidence,'Limited'),'Planning confidence']
      ]
    };
    if (!vm.contractSupported) return `${this.tabExperienceHeader(rt,'planning',planningHeader)}${this.contractGap('Tactical planning unavailable','The backend did not publish canonical Planning energy lanes.')}`;
    const participatingCount = assetTotals.length;
    const nextLines = assetTotals.map(item => this.assetIdentityChip(item.asset,fmtKw(firstDefined(item.asset.requested_power_kw,item.asset.requested_charge_power_kw,item.asset.requested_power_kw_effective),'—'))).join('');
    const planningLoadRows = assetTotals.map(item => {
      const canonical=item.canonical||{};
      const nextRaw=String(firstDefined(canonical.what_text,canonical.next_action_label,canonical.next_action,canonical.today_label,'') || '').trim();
      const next=nextRaw && !/^(wait|none)$/i.test(nextRaw) ? human(nextRaw) : '';
      const whyRaw=String(firstDefined(canonical.why_text,canonical.reason_label,canonical.reason,'') || '').trim();
      const why=whyRaw && !/^(none|no explanation available\.?|no explanation published\.?)$/i.test(whyRaw) ? humanReason(whyRaw,'') : '';
      const eligibility = canonical.planning_eligible === true ? 'Planning ready' : String(firstDefined(canonical.user_status,item.asset.user_status,'Incomplete'));
      const planStatus = firstDefined(canonical.planning_status,canonical.plan_conformance_label,canonical.exception_label,canonical.risk_label,eligibility);
      const facts=[
        ['Requested power',fmtKw(firstDefined(item.asset.requested_power_kw_effective,item.asset.requested_power_kw,item.asset.requested_charge_power_kw),'—')],
        [vm.horizonId==='D1'?'Planned tomorrow':'Planned today',fmtKwh(item.plannedEnergy,'—')],
        next ? ['Next action',next] : null,
        why ? ['Reason',why] : null
      ].filter(Boolean);
      return `<article class="planningLoadRow compactPlanningLoad"><div class="planningLoadIdentity">${this.assetVisual(item.asset,{size:'sm',fallbackIcon:this.planningAssetIcon(item.asset)})}<div><b>${escapeHtml(this.planningAssetName(item.asset))}</b><small>${escapeHtml(eligibility)}</small></div></div><div class="compactPlanningFacts">${facts.map(([label,value])=>`<span><small>${escapeHtml(label)}</small><b>${escapeHtml(value)}</b></span>`).join('')}</div><b class="planStatusBadge ${/at.?risk|blocked|failed|incomplete/i.test(String(planStatus))?'exception':'unknown'}">${escapeHtml(planStatus)}</b></article>`;
    }).join('');
    const incompletePlanningRows = asArray(vm.assets).filter(asset => asset && asset.planning_input_ready === false).map(asset => { const blockers=asArray(asset.planning_blockers); const userReason=blockers.includes('target_soc_not_configured')?'Set a target charge level.':blockers.includes('ready_by_not_configured')?'Set a ready-by time.':blockers.includes('charger_not_assigned')?'Assign a charger.':'Charging information is incomplete.'; return `<article class="planningLoadRow planningInputIncomplete"><div class="planningLoadIdentity">${this.assetVisual(asset,{size:'sm',fallbackIcon:this.planningAssetIcon(asset)})}<div><div class="planningLoadName"><b>${escapeHtml(this.planningAssetName(asset))}</b></div><small>${escapeHtml(userReason)}</small></div></div><div><small>Current charge</small><b>${fmtPct(asset.current_soc_pct)}</b></div><div><small>Target</small><b>${fmtPct(asset.target_soc_pct)}</b></div><div><small>Ready by</small><b>${escapeHtml(asset.ready_by || 'Not set')}</b></div><div><small>Charging power</small><b>${fmtKw(asset.max_power_kw,'—')}</b></div><div><small>Status</small><b class="planStatusBadge exception">Needs setup</b></div></article>`; }).join('');
    return `${this.tabExperienceHeader(rt,'planning',planningHeader)}
    ${this.bodyContextBar(rt,'planning','planning-body')}
    <div id="planning-body" class="planningPage"><section class="panel planningMatrixPanel"><div class="planningMatrixHead"><div><h2>${horizonLabel} hourly energy lanes</h2><p>${vm.buckets.length} published bucket${vm.buckets.length===1?'':'s'} · backend timestamps preserved · no interpolation · zero values hidden · Grid out fixed at table end</p></div><span>All primary values are kWh per bucket</span></div><div class="planningTableWrap"><table class="planningTable planningLaneTable"><thead><tr class="planningLaneGroups"><th rowspan="2"><span class="planningSystemHead">${this.planningIconBadge('◷','blue','system')}<b>Time</b></span></th>${sourceLaneCount?`<th colspan="${sourceLaneCount}">Sources</th>`:''}${consumerLaneCount?`<th colspan="${consumerLaneCount}">Consumers</th>`:''}${boundaryLaneCount?`<th colspan="${boundaryLaneCount}">Boundary</th>`:''}</tr><tr>${systemHeaders}${assetHeaders}${boundaryHeaders}</tr></thead><tbody>${rows}<tr class="planningTotalSpacer" aria-hidden="true"><td colspan="${1+sourceLaneCount+consumerLaneCount+boundaryLaneCount}"></td></tr><tr class="planningTotalRow"><th><b>TOTAL</b><small>published by Planning</small></th>${fixedTotalCells}${assetTotalCells}${boundaryTotalCells}</tr></tbody></table></div><div class="planningFooter"><div><small>Planned flexible energy (${horizonLabel.toLowerCase()})</small><div>${plannedTotals || '<span>—</span>'}</div>${summaryTotals}</div><div><small>Planning balance</small><b>${escapeHtml(balanceLabel)}</b></div><div><small>Confidence</small><b>${escapeHtml(this.productStateLabel(confidence,'Limited'))}</b></div><div><small>Operational rule</small><b>${escapeHtml(disclosure)}</b></div></div></section></div><section class="panel plannedFlexibleLoads" id="planning-flexible-loads"><div class="energySectionHead"><div><h2>Planned flexible loads</h2><p>Canonical Tactical plan projected without frontend recalculation.</p></div></div><div class="planningLoadList">${planningLoadRows || incompletePlanningRows || '<div class="empty"><b>No flexible loads currently need planning</b></div>'}</div></section>`;
  },

strategicPlanning(rt) {
    const base = this.buildPageViewModel(rt, 'strategies');
    const topics = rt.strategyBehaviorTopics();
    const valueText = row => {
      const value = firstDefined(row.effective_value,row.value,row.configured_value,row.selected_value,row.current_value,null);
      if (value === null || value === undefined || value === '') return 'Not published';
      return this.genericValueWithUnit(value, firstDefined(row.unit,row.native_unit,''));
    };
    const topicCards = topics.map(topic => {
      const properties = asArray(topic.properties);
      const lines = properties.slice(0,8).map(row => {
        const label = this.profileFieldLabel(row);
        return `<div class="strategicBehaviorRow"><span>${escapeHtml(label)}</span><b>${escapeHtml(valueText(row))}</b></div>`;
      }).join('');
      return `<section class="panel strategicBehaviorCard"><h2>${escapeHtml(topic.topic_label || human(topic.topic_id))}</h2><div class="strategicBehaviorRows">${lines || '<div class="empty compact"><span>No effective values published.</span></div>'}</div></section>`;
    }).join('');

    const allProperties = topics.flatMap(topic => asArray(topic.properties));
    const automationRow = allProperties.find(row => String(firstDefined(row.property_id,row.property_key,row.key,'') || '') === 'energy.automation_mode') || null;
    const objectiveRow = allProperties.find(row => ['home.primary_objective','strategy.home.primary_objective'].includes(String(firstDefined(row.property_id,row.property_key,row.key,'') || ''))) || null;
    const mode = automationRow ? valueText(automationRow) : this.productStateLabel(rt.value('energy_intelligence.automation_mode','advice'),'Advice');
    const objective = objectiveRow ? valueText(objectiveRow) : '';
    const posture = [mode,objective].filter(value=>value && value!=='Not published').join(' · ');
    const model = {
      ...base,
      image:hbEnergyHeroAsset('strategic-planning'),
      title:'Strategic Planning',
      explanation:'What your current Energy settings mean for longer-term behavior.',
      metrics:[
        ['◎','Strategy',posture || 'Not available','Current longer-term posture'],
        ['◇','Topics',String(topics.length),'Policy areas influencing your strategy'],
        ['↗','Tactical horizon','D0 / D1','Today and tomorrow remain in Tactical Planning']
      ]
    };
    return `${this.tabExperienceHeader(rt,'strategic-planning',model)}
      <div class="strategicPlanningPage strategicBehaviorPage">
        <section class="panel strategicPlanningIntro compactStrategicIntro"><small>LONGER-TERM BEHAVIOR</small><h2>${escapeHtml(posture || 'Strategy not available')}</h2><p>Strategy configuration is the authority for longer-term intent. This read-only view explains the effective meaning of your current Settings; Tactical Planning decides today/tomorrow and Operational Planning handles execution.</p></section>
        <div class="strategicBehaviorGrid">${topicCards || '<section class="panel"><div class="empty"><b>No long-term strategy available</b><span>Long-term strategy details are not available yet.</span></div></section>'}</div>
      </div>`;
  }
});
