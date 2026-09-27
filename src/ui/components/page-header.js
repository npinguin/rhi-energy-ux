// Energy domain adapter onto shared RHI UX Core presentation primitives.
// Domain semantics arrive fully interpreted through pageViewModel.
// Page-level controls are intentionally one surface: context/navigation is
// separated from executable commands without creating duplicate action bars.
function rhiEnergyPageHeader({
  sectionLabel = "Energy",
  itemLabel = "",
  title = "",
  description = "",
  hero = "",
  metrics = [],
  contextControls = "",
  commandActions = "",
  tone = ""
} = {}) {
  const eyebrow = [sectionLabel, itemLabel].filter(Boolean).join(" / ");
  const heroMarkup = rhiUxPageHero({
    eyebrow,
    title,
    description,
    image:hero,
    imageAlt:""
  });
  const statusMarkup = rhiUxStatusGrid((metrics || []).map(([icon,label,value,detail]) => ({
    icon:icon || "•",
    label:label || "",
    value:value ?? "—",
    detail:detail || ""
  })));

  const contextGroup = contextControls
    ? `<div class="rhiEnergyControlGroup context"><small>View</small><div class="rhiUxQuickActions">${contextControls}</div></div>`
    : "";
  const commandGroup = commandActions
    ? `<div class="rhiEnergyControlGroup commands"><small>Quick actions</small><div class="rhiUxQuickActions">${commandActions}</div></div>`
    : "";
  const actionsMarkup = (contextGroup || commandGroup)
    ? `<section class="rhiEnergyPageControls rhiUxQuickActionBar" aria-label="Page controls">${contextGroup}${commandGroup}</section>`
    : "";

  return `<section class="rhiEnergyPageHeader rhiUxPageStack ${rhiUxEscape(tone)}">${heroMarkup}${statusMarkup}${actionsMarkup}</section>`;
}
