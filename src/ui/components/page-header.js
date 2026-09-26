// Energy domain adapter onto shared RHI UX Core presentation primitives.
// Domain semantics arrive fully interpreted through pageViewModel.
function rhiEnergyPageHeader({ sectionLabel = "Energy", itemLabel = "", title = "", description = "", hero = "", metrics = [], quickActions = "", tone = "" } = {}) {
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
  const actionsMarkup = quickActions ? `<div class="rhiEnergyQuickActions"><small>Quick actions</small><div class="rhiUxQuickActions">${quickActions}</div></div>` : "";
  return `<section class="rhiEnergyPageHeader ${rhiUxEscape(tone)}">${heroMarkup}${statusMarkup}${actionsMarkup}</section>`;
}
