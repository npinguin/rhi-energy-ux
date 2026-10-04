// Energy insight screens. Presentation only; measured/value/review truth stays backend-owned.
const RHI_ENERGY_INSIGHT_PAGE_METHODS = Object.freeze({
metering(rt) {
    const pageVm = this.buildPageViewModel(rt, 'metering');
    const vm = this.buildMeteringPeriodViewModel(rt);
    if (!vm.available && !vm.summaryHasData) {
      const requiredRemediation = vm.quality?.user_action_required === true && vm.command
        ? { command:vm.command }
        : null;
      return this.tabExperienceHeader(rt,'metering',pageVm) + this.meteringNotPublishedPeriod(vm.periods, requiredRemediation);
    }
    return this.tabExperienceHeader(rt,'metering',pageVm) + this.meteringCleanPage(vm);
  },

value(key, fallback = null) { return rowValue(this.row(key), fallback); },

retrospective(rt) {
    const review=this.retrospectiveModel();
    const vm=this.buildPageViewModel(rt,'retrospective');
    if (!review.available) {
      const steps=(review.prerequisites.length ? review.prerequisites : [
        {label:'Planning outcomes',state:'PENDING',ready:false},
        {label:'Execution results',state:'PENDING',ready:false},
        {label:'Measured energy',state:'PENDING',ready:false}
      ]).map(step=>`<span><b>${escapeHtml(step.label)}</b><em>${escapeHtml(step.ready?'Ready':human(step.state || 'Pending'))}</em>${step.reason?`<small>${escapeHtml(step.reason)}</small>`:''}</span>`).join('');
      return `${this.tabExperienceHeader(rt,'retrospective',vm)}<div class="retrospectivePage"><section class="panel retroCollectingState"><div class="retroCollectingIcon">↺</div><div><small>REVIEW PREREQUISITES</small><h2>${escapeHtml(review.rating || 'Waiting for evidence')}</h2><p>${escapeHtml(review.explanation)}</p><div class="retroEvidenceSteps">${steps}</div><div class="productNotice"><b>No action required</b><span>The review appears automatically when the published prerequisites are complete.</span></div></div></section></div>`;
    }
    const scoreOf=row=>asNumber(firstDefined(row.score,row.score_pct,row.value,row.achieved_score));
    const weightOf=row=>asNumber(firstDefined(row.weight,row.weight_pct));
    const statusOf=row=>human(firstDefined(row.status,row.rating,row.state,scoreOf(row)!==null?(scoreOf(row)>=90?'Excellent':scoreOf(row)>=75?'Good':'Improving'):'Collecting evidence'));
    const titleOf=(row,fallback)=>human(firstDefined(row.label,row.title,row.name,row.kpi_name,row.objective,row.recommendation,row.recommendation_title,fallback));
    const explanationOf=row=>humanReason(firstDefined(row.explanation,row.reason,row.summary,row.reasoning,row.description),'No additional explanation published.');
    const kpis=review.kpis.map((row,i)=>{const score=scoreOf(row);const weight=weightOf(row);return `<article class="retroKpiCard"><div class="retroKpiHead"><span>${escapeHtml(firstDefined(row.icon,'◎'))}</span><div><h3>${escapeHtml(titleOf(row,`Objective ${i+1}`))}</h3><p>${escapeHtml(explanationOf(row))}</p></div><strong>${score===null?'—':Math.round(score)}</strong></div><div class="retroProgress"><i style="width:${Math.max(0,Math.min(100,score||0))}%"></i></div><footer><span>${escapeHtml(statusOf(row))}</span><span>${weight===null?'Measured objective':`${Math.round(weight)}% weight`}</span></footer></article>`;}).join('');
    const deductions=review.deductions.slice(0,4).map((row,i)=>{const points=Math.abs(asNumber(firstDefined(row.points_lost,row.deduction_points,row.score_impact,row.points))||0);return `<article class="retroOpportunity"><span class="retroOpportunityIcon">${escapeHtml(firstDefined(row.icon,'↗'))}</span><div><h3>${escapeHtml(titleOf(row,`Opportunity ${i+1}`))}</h3><p>${escapeHtml(explanationOf(row))}</p></div><strong>${points?`+${Math.round(points)} potential`:'Review'}</strong></article>`;}).join('');
    const rec=review.recommendations[0]||null;
    const expected=rec?asNumber(firstDefined(rec.expected_score_gain,rec.score_gain,rec.expected_gain_points,rec.impact_points)):null;
    const confidence=rec?human(firstDefined(rec.confidence,review.confidence)):'Not available';
    const risk=rec?human(firstDefined(rec.risk,'Low')):'Not available';
    const lessons=review.kpis.filter(r=>{const v=scoreOf(r);return v!==null&&v>=80;}).slice(0,3).map(r=>`<div class="retroLesson"><span>✓</span><div><b>${escapeHtml(titleOf(r,'Objective'))}</b><p>${escapeHtml(explanationOf(r))}</p></div></div>`).join('');
    const empty=`<div class="empty"><b>Collecting evidence</b><span>This section appears when Energy Intelligence publishes enough measurable evidence.</span></div>`;
    const chainRows = Object.entries(review.chainAssessment || {}).filter(([key])=>key!=='overall').map(([key,value])=>`<div class="goalRow"><span>${escapeHtml(human(key))}</span><b>${escapeHtml(human(value))}</b></div>`).join('');
    const executionSummary = review.executionKpis && Object.keys(review.executionKpis).length ? `<div class="goalGrid"><div class="goalRow"><span>Execution results</span><b>${escapeHtml(String(firstDefined(review.executionKpis.result_count,'—')))}</b></div><div class="goalRow"><span>Confirmed successes</span><b>${escapeHtml(String(firstDefined(review.executionKpis.success_count,'—')))}</b></div><div class="goalRow"><span>Failures</span><b>${escapeHtml(String(firstDefined(review.executionKpis.failure_count,'—')))}</b></div><div class="goalRow"><span>Pending</span><b>${escapeHtml(String(firstDefined(review.executionKpis.pending_count,'—')))}</b></div></div>` : '';
    const introText = review.collecting ? 'This period is still open. Available objective and execution evidence is shown now; the final score and trend remain unavailable until the period closes.' : review.explanation;
    return `${this.tabExperienceHeader(rt,'retrospective',vm)}<div class="retrospectivePage"><section class="retroIntro"><div><small>${review.collecting?'Open period review':'Weekly review'}</small><h2>${escapeHtml(review.rating)}</h2><p>${escapeHtml(introText)}</p></div><div class="retroScoreRing"><strong>${escapeHtml(review.scoreText)}</strong><span>${review.score===null?'score pending':'out of 100'}</span></div></section><section class="panel" id="retrospective-details"><div class="portalSectionHeader"><div><small>Current evidence</small><h2>What the system can already conclude</h2><p>Published planning, execution and goal evidence is shown even while the period is still open.</p></div><strong>${escapeHtml(review.coverageText)} covered</strong></div>${chainRows?`<div class="goalGrid">${chainRows}</div>`:''}${executionSummary}</section><section class="panel" id="retrospective-objectives"><div class="portalSectionHeader"><div><small>Objectives</small><h2>How well did Energy Intelligence perform?</h2><p>Each objective shows its currently published evidence status.</p></div><strong>${escapeHtml(review.coverageText)} covered</strong></div><div class="retroKpiGrid">${kpis||empty}</div></section><section class="panel" id="retrospective-opportunities"><div class="portalSectionHeader"><div><small>Issues and opportunities</small><h2>What needs attention?</h2><p>Published deviations and opportunities explain where the chain did not deliver as intended.</p></div></div><div class="retroOpportunityList">${deductions||empty}</div></section><section class="panel retroLessons"><div class="portalSectionHeader"><div><small>What went well</small><h2>Strengths from this period</h2></div></div>${lessons||empty}</section><section class="panel retroBestNext"><small>Next best improvement</small><h2>${escapeHtml(rec?titleOf(rec,'Recommended improvement'):(review.collecting?'Waiting for closed evidence':'Still learning'))}</h2><p>${escapeHtml(rec?explanationOf(rec):(review.collecting?'A final recommendation is published when the review period closes and sufficient objective evidence is available.':'Home Intelligence will prioritise one improvement when sufficient evidence is available.'))}</p><div class="retroImpact"><div><span>Expected gain</span><strong>${expected===null?'—':`+${Math.round(expected)} points`}</strong></div><div><span>Confidence</span><strong>${escapeHtml(confidence)}</strong></div><div><span>Risk</span><strong>${escapeHtml(risk)}</strong></div></div></section></div>`;
  }
});
