// Compact Energy logical-device image editor.
// Presentation-only: selection is drafted in the card and persisted only on explicit Save.
class HomeBrainEnergyVisualPicker {
  constructor() {}

  catalogFor(asset = {}) {
    const type = String(asset.asset_type || asset.object_class || "").trim().toLowerCase();
    return typeof rhiEnergyVisualCatalogForType === "function" ? rhiEnergyVisualCatalogForType(type) : [];
  }

  render(asset = {}, selectedRef = "", { draftRef = "", brand = "all", feedback = "" } = {}) {
    const assetId = String(asset.asset_id || asset.id || "").trim();
    const type = String(asset.asset_type || asset.object_class || "").trim().toLowerCase();
    const choices = this.catalogFor(asset);
    if (!assetId || !type || !choices.length) return "";

    const current = String(draftRef || selectedRef || "").trim();
    const brands = typeof rhiEnergyVisualBrandsForType === "function"
      ? rhiEnergyVisualBrandsForType(type)
      : [...new Set(choices.map(entry => String(entry.brand || "").trim()).filter(Boolean))].sort();
    const activeBrand = brand !== "all" && brands.includes(brand) ? brand : "all";
    const visible = activeBrand === "all" ? choices : choices.filter(entry => String(entry.brand || "") === activeBrand);

    const filters = brands.length > 1
      ? `<div class="energyVisualBrandFilter" aria-label="Filter images by brand">
          <button type="button" class="${activeBrand === "all" ? "selected" : ""}" data-energy-visual-brand="all">All</button>
          ${brands.map(item => `<button type="button" class="${activeBrand === item ? "selected" : ""}" data-energy-visual-brand="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("")}
        </div>`
      : "";

    const cards = visible.map(entry => {
      const ref = rhiEnergyVisualRef(entry);
      const visual = typeof resolveEnergyVisualRef === "function" ? resolveEnergyVisualRef(ref) : null;
      const selected = ref === current;
      return `<button class="rhiUxVisualChoice energyVisualChoice ${selected ? "selected" : ""}" type="button" data-energy-visual-select="${escapeHtml(ref)}" data-energy-visual-asset="${escapeHtml(assetId)}" aria-pressed="${selected ? "true" : "false"}">
        <span class="rhiUxVisualChoiceImage energyVisualChoiceImage">${visual?.url ? `<img src="${escapeHtml(visual.url)}" alt="">` : ""}</span>
        <span class="rhiUxVisualChoiceCopy energyVisualChoiceCopy"><small>${escapeHtml(entry.brand || "Representative")}</small><b>${escapeHtml(entry.model || entry.label)}</b><em>${escapeHtml(entry.variant || human(type))}</em></span>
      </button>`;
    }).join("");

    const closeHtml = `<button type="button" class="energyVisualClose" data-energy-visual-cancel="1" aria-label="Cancel">×</button>`;
    const resetHtml = `<button type="button" data-energy-visual-reset="${escapeHtml(assetId)}">Use profile default</button>`;
    const cancelHtml = `<button type="button" data-energy-visual-cancel="1">Cancel</button>`;
    const saveHtml = `<button type="button" class="primary" data-energy-visual-save="${escapeHtml(assetId)}" ${current ? "" : "disabled"}>Save appearance</button>`;
    const filterHtml = brands.length > 1
      ? `<button type="button" class="${activeBrand === "all" ? "selected" : ""}" data-energy-visual-brand="all">All</button>${brands.map(item => `<button type="button" class="${activeBrand === item ? "selected" : ""}" data-energy-visual-brand="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("")}`
      : "";
    const selectedHtml = feedback ? `<small class="energyVisualFeedback">${escapeHtml(feedback)}</small>` : "";
    return rhiUxVisualPickerShell({
      eyebrow:`Appearance · ${human(type)}`,
      title:"Choose appearance",
      description:"Select the representative product image. The choice is stored in the Energy backend and survives reloads.",
      filtersHtml:filterHtml,
      choicesHtml:cards,
      selectedHtml,
      resetHtml,
      cancelHtml,
      saveHtml,
      modal:true,
      closeHtml
    });
  }
}

function rhiEnergyVisualPickerStyles() {
  return `
    .assetVisual[data-energy-visual-open]{cursor:pointer;outline:0}
    .assetVisual[data-energy-visual-open]:hover{box-shadow:0 0 0 2px rgba(37,99,235,.16)}
    .energyVisualClose{border:0;background:#f1f5f9;border-radius:10px;width:36px;height:36px;font-size:22px;cursor:pointer}
    .energyVisualFeedback{color:#526178;font-size:9.5px;max-width:220px}
  `;
}
