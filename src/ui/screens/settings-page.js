// Energy settings screen. Presentation only; configured/effective policy truth stays backend-owned.
const RHI_ENERGY_SETTINGS_PAGE_METHODS = Object.freeze({
strategies(rt) {
    const pageVm = this.buildPageViewModel(rt, 'strategies');
    const d = rt.decision();
    const profiles = rt.strategyProfileRows();
    const effectiveStrategies = rt.effectiveStrategyRows();
    const fallbackProfile = profiles[0] || null;
    let selected = this.selectedStrategyProfileId
      ? (rt.strategyProfileFor(this.selectedStrategyProfileId) || null)
      : fallbackProfile;
    if (!selected && fallbackProfile) selected = fallbackProfile;
    if (selected && this.selectedStrategyProfileId !== selected.profile_id) this.selectedStrategyProfileId = selected.profile_id;
    const selectedId = selected?.profile_id || '';
    const selectedTopic = selected ? this.profileSettingsTopic(selected) : '';

    const topicGroups = new Map();
    profiles.forEach(profile => {
      const topic = this.profileSettingsTopic(profile);
      if (!topicGroups.has(topic)) topicGroups.set(topic, []);
      topicGroups.get(topic).push(profile);
    });
    const topicOrder = ['Home & priorities','Battery','EV charging','Solar','Grid & tariffs','Home & resilience'];
    const topics = [...topicGroups.entries()].sort(([left],[right]) => {
      const li=topicOrder.indexOf(left), ri=topicOrder.indexOf(right);
      if(li>=0 || ri>=0) return (li<0?99:li)-(ri<0?99:ri);
      return left.localeCompare(right);
    });
    const topicButtons = topics.map(([topic,rows]) => {
      const target = rows[0];
      const active = topic === selectedTopic;
      return `<button type="button" class="settingsTopicButton${active?' active':''}" data-settings-topic-profile="${escapeHtml(target.profile_id || '')}" aria-pressed="${active?'true':'false'}"><b>${escapeHtml(topic)}</b><span>${escapeHtml(this.profileUserDescription(target))}</span></button>`;
    }).join('');
    const selectedGroup = selectedTopic ? (topicGroups.get(selectedTopic) || []) : [];
    const variantSelect = selectedGroup.length > 1
      ? `<label class="settingsVariantSelect"><span>Policy set</span><select data-strategy-profile-select>${selectedGroup.map(profile=>`<option value="${escapeHtml(profile.profile_id)}"${String(profile.profile_id)===String(selectedId)?' selected':''}>${escapeHtml(this.profileUserLabel(profile))}</option>`).join('')}</select></label>`
      : '';

    const automationRow = rt.editableProperty('energy.automation_mode') || rt.row('energy.automation_mode');
    const automationMode = rowValue(automationRow, this.energyAutomationMode(rt,d) || 'advice');
    const automationOptions = allowedValuesForRow(automationRow).length
      ? allowedValuesForRow(automationRow).map(value => ({ value, label:this.productStateLabel(value,human(value)), attrs:{'data-mode-value':value,'data-property-key':'energy.automation_mode'} }))
      : ['automatic','advice','disabled'].map(value => ({ value, label:this.productStateLabel(value,human(value)), attrs:{'data-mode-value':value,'data-property-key':'energy.automation_mode'} }));
    const automationControl = this.isWritableRow(automationRow)
      ? this.componentSegmentedControl(automationOptions, automationMode, 'automationModeControl')
      : `<div class="profileNoControls">Automation mode is not writable in the current public contract.</div>`;

    const effectiveRowsForProfile = selectedId
      ? effectiveStrategies.filter(strategy => {
          const text = `${strategy.profile_id || ''} ${strategy.strategy_profile_id || ''} ${strategy.profile_type || ''} ${strategy.asset_type || ''} ${strategy.policy_profile || ''}`.toLowerCase();
          const wanted = String(selectedId).toLowerCase();
          return text.includes(wanted) || text.includes(String(selected?.profile_type || '').toLowerCase()) || text.includes(String(selected?.asset_type || '').toLowerCase());
        })
      : effectiveStrategies;
    const effectiveRows = (effectiveRowsForProfile.length ? effectiveRowsForProfile : effectiveStrategies).map(strategy => this.effectivePolicyPreviewCard(rt,strategy)).join('');
    const participation = rt.settingsParticipationRows().map(parent => {
      const parentAsset=rt.asset(parent.asset_id) || parent;
      const children=asArray(parent.children);
      return `<article class="settingsParticipationRoot"><div class="settingsParticipationRootHead">${this.assetVisual(parentAsset,{size:'sm',fallbackIcon:this.flexibleAssetIcon(parentAsset)})}<div><b>${escapeHtml(parent.display_name || rt.assetName(parent.asset_id) || human(parent.asset_id))}</b><span>${escapeHtml(human(parent.participation_role || parent.asset_type || 'Participating'))}</span></div></div><div class="settingsParticipationChildren">${children.map(child=>{const childAsset=rt.asset(child.asset_id)||child;return `<div class="settingsParticipationChild">${this.assetVisual(childAsset,{size:'xs',fallbackIcon:this.flexibleAssetIcon(childAsset)})}<div><b>${escapeHtml(child.display_name || rt.assetName(child.asset_id) || human(child.asset_id))}</b><span>${escapeHtml(human(child.relationship_type || child.asset_type || 'Member'))}</span></div></div>`;}).join('')}</div></article>`;
    }).join('');

    return `${this.tabExperienceHeader(rt,'strategies',pageVm)}<div class="strategiesPage settingsTopicPage">
      <section class="panel strategyAutomationMode compactSettingsBlock"><div><h2>Automation</h2><p>Choose how much Home Intelligence may act for you.</p></div>${automationControl}${this.editablePropertyFeedback(automationRow)}</section>
      <section class="panel settingsTopicChooser"><div class="settingsTopicHead"><h2>What do you want to adjust?</h2><p>Settings are grouped by the part of your energy system you want to influence.</p></div><div class="settingsTopicGrid">${topicButtons || '<div class="empty"><b>No settings topics available</b><span>No editable Energy policy profiles are currently published.</span></div>'}</div></section>
      ${selected ? `<section class="settingsSelectedTopic"><div class="settingsSelectedTopicHead"><div><small>SETTINGS</small><h2>${escapeHtml(selectedTopic)}</h2></div>${variantSelect}</div>${this.strategyProfileCard(rt,selected)}</section>` : ''}
      <details class="panel settingsAdvancedDisclosure"><summary>Advanced</summary><div class="settingsAdvancedBody">
        <section><h3>Effective behavior</h3><div class="effectivePolicyList">${effectiveRows || '<div class="empty compact"><b>No effective behavior published</b></div>'}</div></section>
        ${participation ? `<section><h3>Participating assets</h3><div class="settingsParticipationTree">${participation}</div></section>` : ''}
      </div></details>
    </div>`;
  }
});
