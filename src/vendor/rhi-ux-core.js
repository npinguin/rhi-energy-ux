// Vendored build-time snapshot of npinguin/rhi-ux-core 1.2.0
// Source commit: 9c3f60942a1cf68ce30f33c68b532213d7868570
// Runtime dependency: none. This source is bundled into the Energy artifact.
// RHI UX Core 1.2.0 — build-time presentation primitives only.
// No domain semantics or Home Assistant contract/entity knowledge belongs here.
const RHI_UX_CORE_VERSION = "1.2.0";

function rhiUxEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[ch]));
}

function rhiUxDisplay(value, fallback = "—") {
  return value === undefined || value === null || value === "" ? fallback : String(value);
}

function rhiUxStatusItem({ icon = "•", label = "", value = "—", detail = "" } = {}) {
  return `<div class="rhiUxStatusItem"><span class="rhiUxStatusIcon">${rhiUxEscape(icon)}</span><div class="rhiUxStatusCopy"><small>${rhiUxEscape(label)}</small><b>${rhiUxEscape(rhiUxDisplay(value))}</b>${detail ? `<em>${rhiUxEscape(detail)}</em>` : ""}</div></div>`;
}

function rhiUxStatusGrid(items = []) {
  return `<section class="rhiUxStatusGrid">${items.map(rhiUxStatusItem).join("")}</section>`;
}

function rhiUxPageHero({ eyebrow = "", title = "", description = "", image = "", imageAlt = "" } = {}) {
  return `<section class="rhiUxPageHero"><div class="rhiUxPageHeroCopy">${eyebrow ? `<small>${rhiUxEscape(eyebrow)}</small>` : ""}<h2>${rhiUxEscape(title)}</h2>${description ? `<p>${rhiUxEscape(description)}</p>` : ""}</div>${image ? `<div class="rhiUxPageHeroArt"><img src="${rhiUxEscape(image)}" alt="${rhiUxEscape(imageAlt)}"></div>` : ""}</section>`;
}

function rhiUxState({ state = "unavailable", title = "Unavailable", detail = "" } = {}) {
  return `<div class="rhiUxState" data-state="${rhiUxEscape(state)}"><b>${rhiUxEscape(title)}</b>${detail ? `<span>${rhiUxEscape(detail)}</span>` : ""}</div>`;
}

function rhiUxConclusion({ title = "", detail = "", label = "Conclusion" } = {}) {
  return `<section class="rhiUxConclusion"><div><small>${rhiUxEscape(label)}</small><h2>${rhiUxEscape(title)}</h2>${detail ? `<p>${rhiUxEscape(detail)}</p>` : ""}</div></section>`;
}

function rhiUxTechnicalFooter({ product = "", uxVersion = "", backendVersion = "", issue = "", severity = "" } = {}) {
  return `<footer class="rhiUxTechnicalFooter"><span>${rhiUxEscape(product)} UX ${rhiUxEscape(uxVersion)}</span><span>Backend ${rhiUxEscape(rhiUxDisplay(backendVersion,"Unknown"))}</span>${issue ? `<span data-severity="${rhiUxEscape(severity)}">${rhiUxEscape(issue)}</span>` : ""}</footer>`;
}

function rhiUxDomainShell({ product = "Home Intelligence", domain = "", modules = [], activeModule = "", activeItem = "", brandHtml = "" } = {}) {
  const selected = modules.find(row => String(row.id || "") === String(activeModule || "")) || modules[0] || { items:[] };
  const moduleButtons = modules.map(row => {
    const active = String(row.id || "") === String(selected.id || "");
    return `<button type="button" class="rhiUxModuleTab${active ? " active" : ""}" data-rhi-module="${rhiUxEscape(row.id || "")}"${row.target ? ` data-nav="${rhiUxEscape(row.target)}"` : ""}><span>${rhiUxEscape(row.label || row.id || "")}</span></button>`;
  }).join("");
  const itemButtons = (selected.items || []).map(row => {
    const active = String(row.id || "") === String(activeItem || "");
    return `<button type="button" class="rhiUxDomainTab${active ? " active" : ""}" data-rhi-item="${rhiUxEscape(row.id || "")}"${row.target ? ` data-nav="${rhiUxEscape(row.target)}"` : ""}><span>${rhiUxEscape(row.label || row.id || "")}</span></button>`;
  }).join("");
  return `<header class="rhiUxDomainShell"><div class="rhiUxProductArea"><div class="rhiUxDomainShellTop"><div class="rhiUxDomainIdentity"><span>${rhiUxEscape(product)}</span><strong>${rhiUxEscape(domain)}</strong></div><nav class="rhiUxModuleTabs" aria-label="Modules">${moduleButtons}</nav></div><div class="rhiUxDomainShellBottom"><nav class="rhiUxDomainTabs" aria-label="${rhiUxEscape(selected.label || domain || "Domain")} navigation">${itemButtons}</nav></div></div>${brandHtml ? `<div class="rhiUxCompanyBrand">${brandHtml}</div>` : ""}</header>`;
}

function rhiUxCoreStyles() {
  return `:host,.rhi-ux-root{
  --rhi-color-primary:#1467F5;
  --rhi-color-primary-soft:#EAF3FF;
  --rhi-color-text:#0F172A;
  --rhi-color-muted:#64748B;
  --rhi-color-line:#E2E8F0;
  --rhi-color-surface:#FFFFFF;
  --rhi-color-surface-soft:#F8FAFC;
  --rhi-color-ok:#22C55E;
  --rhi-color-attention:#F59E0B;
  --rhi-color-error:#B42318;
  --rhi-color-unknown:#94A3B8;
  --rhi-space-1:4px;
  --rhi-space-2:8px;
  --rhi-space-3:12px;
  --rhi-space-4:16px;
  --rhi-space-5:20px;
  --rhi-space-6:24px;
  --rhi-radius-sm:10px;
  --rhi-radius-md:14px;
  --rhi-radius-lg:18px;
  --rhi-radius-xl:22px;
  --rhi-shadow-sm:0 8px 22px rgba(15,35,80,.04);
  --rhi-shadow-md:0 12px 30px rgba(15,35,80,.055);
  --rhi-page-max:1640px;
  --rhi-page-pad-x:28px;
  --rhi-page-pad-y:18px;
  --rhi-break-phone:430px;
  --rhi-break-tablet:760px;
  --rhi-break-desktop:1024px;
  --rhi-domain-accent:var(--rhi-color-primary);
  color:var(--rhi-color-text);
  font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
}

.rhiUxDomainShell{
  --rhi-nav-active-bg:var(--rhi-color-primary-soft);
  --rhi-nav-active-border:#CFDEF1;
  --rhi-nav-active-text:#0F4CA4;
  position:relative;
  display:grid;
  grid-template-columns:minmax(0,1fr) clamp(190px,23%,280px);
  width:100%;
  margin:0 0 12px;
  border:1px solid rgba(207,217,230,.86);
  border-radius:var(--rhi-radius-xl);
  background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(249,251,254,.91));
  box-shadow:var(--rhi-shadow-md);
  overflow:hidden;
}
.rhiUxProductArea{min-width:0;overflow:hidden}
.rhiUxDomainShellTop{min-height:78px;display:grid;grid-template-columns:minmax(168px,.52fr) minmax(0,1.48fr);align-items:center;gap:14px;padding:10px 22px 9px}
.rhiUxDomainIdentity{display:grid;align-content:center;gap:2px;min-width:0;min-height:56px;padding:2px 0 0 4px}
.rhiUxDomainIdentity span{font-size:13px;line-height:1.15;font-weight:450;color:#58708F;white-space:nowrap}
.rhiUxDomainIdentity strong{font-size:21px;line-height:1.03;letter-spacing:.045em;font-weight:650;color:#0B467F;white-space:nowrap}
.rhiUxModuleTabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;min-width:0}
.rhiUxModuleTab,.rhiUxDomainTab{appearance:none;border:0;background:transparent;font:inherit;color:#53647D;cursor:pointer;white-space:nowrap}
.rhiUxModuleTab{min-height:46px;border-radius:13px;padding:8px;font-size:12px;font-weight:560}
.rhiUxModuleTab.active{background:var(--rhi-nav-active-bg);color:var(--rhi-nav-active-text);box-shadow:inset 0 0 0 1px var(--rhi-nav-active-border),0 6px 16px rgba(15,23,42,.035)}
.rhiUxDomainShellBottom{padding:7px 22px 9px;border-top:1px solid rgba(226,232,240,.82);background:rgba(255,255,255,.52);min-height:52px;box-sizing:border-box}
.rhiUxDomainTabs{display:flex;align-items:center;gap:10px;min-height:34px;overflow-x:auto;scrollbar-width:none}
.rhiUxDomainTabs::-webkit-scrollbar{display:none}
.rhiUxDomainTab{flex:0 0 auto;min-height:34px;border-radius:11px;padding:7px 12px;font-size:11.5px;font-weight:520;color:#5F6D80}
.rhiUxDomainTab.active{background:var(--rhi-nav-active-bg);color:var(--rhi-nav-active-text);box-shadow:inset 0 0 0 1px var(--rhi-nav-active-border)}
.rhiUxCompanyBrand{min-width:0;border-left:1px solid rgba(226,232,240,.82);display:grid;place-items:center;padding:10px 16px;background:linear-gradient(180deg,rgba(252,254,255,.78),rgba(247,250,253,.58))}
@media(max-width:760px){
  .rhiUxDomainShell{grid-template-columns:1fr}
  .rhiUxCompanyBrand{display:none}
  .rhiUxDomainShellTop{grid-template-columns:1fr;padding:10px 12px}
  .rhiUxDomainIdentity{min-height:auto}
  .rhiUxDomainShellBottom{padding:7px 12px 9px}
}

.rhiUxPageHero{
  position:relative;
  min-height:136px;
  display:grid;
  grid-template-columns:minmax(0,1.28fr) minmax(280px,.72fr);
  align-items:stretch;
  gap:14px;
  overflow:hidden;
  border:1px solid var(--rhi-color-line);
  border-radius:var(--rhi-radius-lg) var(--rhi-radius-lg) 0 0;
  background:linear-gradient(135deg,#F8FBFF 0%,#FFFFFF 52%,#EEF5FF 100%);
  box-shadow:var(--rhi-shadow-md);
}
.rhiUxPageHeroCopy{min-width:0;padding:18px 0 18px 22px;align-self:center}
.rhiUxPageHeroCopy>small{display:block;margin:0 0 4px;font-size:9px;font-weight:760;letter-spacing:.13em;text-transform:uppercase;color:#5E6E84}
.rhiUxPageHeroCopy h2{margin:0 0 5px;font-size:clamp(24px,2.2vw,34px);line-height:1.02;letter-spacing:-.035em;color:var(--rhi-color-text);font-weight:680}
.rhiUxPageHeroCopy p{margin:0;max-width:720px;color:var(--rhi-color-muted);font-size:11.5px;line-height:1.38;font-weight:520}
.rhiUxPageHeroArt{position:relative;min-height:136px;display:flex;align-items:center;justify-content:flex-end;overflow:hidden;pointer-events:none}
.rhiUxPageHeroArt img{width:100%;height:100%;min-height:136px;max-height:148px;object-fit:cover;object-position:center 56%}
.rhiUxStatusGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--rhi-space-2);padding:var(--rhi-space-2);border:1px solid var(--rhi-color-line);border-top:0;border-radius:0 0 var(--rhi-radius-lg) var(--rhi-radius-lg);background:var(--rhi-color-surface);box-shadow:var(--rhi-shadow-md)}
.rhiUxStatusItem{min-width:0;min-height:58px;display:grid;grid-template-columns:30px minmax(0,1fr);gap:var(--rhi-space-2);align-items:center;padding:9px 11px;border:1px solid #EDF1F6;border-radius:var(--rhi-radius-md);background:var(--rhi-color-surface-soft)}
.rhiUxStatusIcon{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:#fff;border:1px solid #E6EDF7;font-size:15px}
.rhiUxStatusCopy{min-width:0;display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:6px;align-items:baseline}
.rhiUxStatusCopy small{font-size:9.5px;line-height:1.1;color:#718096;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rhiUxStatusCopy b{font-size:13px;line-height:1.1;font-weight:680;color:var(--rhi-color-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rhiUxStatusCopy em{grid-column:1/-1;margin-top:2px;font-size:9px;line-height:1.15;font-style:normal;color:var(--rhi-color-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rhiUxQuickActions{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:var(--rhi-space-2) 0}
.rhiUxQuickAction{min-height:34px;padding:0 10px;border:1px solid var(--rhi-color-line);border-radius:8px;background:var(--rhi-color-surface);color:var(--rhi-color-text);font:inherit;font-size:10.5px;cursor:pointer}
.rhiUxPanel{border:1px solid var(--rhi-color-line);border-radius:var(--rhi-radius-lg);background:var(--rhi-color-surface);box-shadow:var(--rhi-shadow-sm);padding:14px 16px}
.rhiUxDataList{display:grid;gap:6px}
.rhiUxDataRow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:9px 10px;border:1px solid #EDF1F6;border-radius:var(--rhi-radius-sm);background:var(--rhi-color-surface-soft)}
.rhiUxState{display:grid;gap:4px;padding:14px 16px;border:1px dashed var(--rhi-color-line);border-radius:var(--rhi-radius-md);background:var(--rhi-color-surface-soft);color:var(--rhi-color-muted)}
.rhiUxState b{color:var(--rhi-color-text);font-size:13px}
.rhiUxState[data-state="attention"]{border-color:#F6D48C;background:#FFFBEB}
.rhiUxState[data-state="error"]{border-color:#F1B8B4;background:#FFF7F7}
.rhiUxConclusion{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:12px;margin:8px 0 0;padding:10px 12px;border:1px solid var(--rhi-color-line);border-radius:var(--rhi-radius-md);background:linear-gradient(135deg,rgba(255,255,255,.98),rgba(247,250,252,.96))}
.rhiUxConclusion small{font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--rhi-color-muted)}
.rhiUxConclusion h2{font-size:13px;line-height:1.2;margin:1px 0 2px}
.rhiUxConclusion p{font-size:10px;line-height:1.3;margin:0;color:var(--rhi-color-muted)}
.rhiUxTechnicalFooter{display:flex;justify-content:center;flex-wrap:wrap;gap:4px 9px;margin:6px 0 0;padding:3px 2px 0;border-top:1px solid rgba(148,163,184,.20);color:#94A3B8;font-size:8.5px;line-height:1.2}
.rhiUxTechnicalFooter span+span:before{content:"·";margin-right:9px;color:#CBD5E1}
.rhiUxTechnicalFooter [data-severity="warning"]{color:#B7791F;font-weight:650}
.rhiUxTechnicalFooter [data-severity="error"]{color:var(--rhi-color-error);font-weight:650}
@media(max-width:1024px){
  :host,.rhi-ux-root{--rhi-page-pad-x:18px;--rhi-page-pad-y:14px}
  .rhiUxPageHero{grid-template-columns:minmax(0,1fr) minmax(240px,.62fr);min-height:142px}
}
@media(max-width:760px){
  :host,.rhi-ux-root{--rhi-page-pad-x:10px;--rhi-page-pad-y:10px}
  .rhiUxPageHero{min-height:126px;grid-template-columns:minmax(0,1fr) minmax(118px,.42fr);gap:2px}
  .rhiUxPageHeroCopy{padding:13px 0 13px 13px}
  .rhiUxPageHeroCopy h2{font-size:23px}
  .rhiUxPageHeroArt,.rhiUxPageHeroArt img{min-height:126px;max-height:126px}
  .rhiUxStatusGrid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .rhiUxConclusion{grid-template-columns:1fr}
}
@media(max-width:430px){
  :host,.rhi-ux-root{--rhi-page-pad-x:8px;--rhi-page-pad-y:8px}
  .rhiUxPageHero{min-height:118px;grid-template-columns:minmax(0,1fr) 110px}
  .rhiUxPageHeroCopy{padding:11px 0 11px 11px}
  .rhiUxPageHeroCopy h2{font-size:21px}
  .rhiUxPageHeroArt,.rhiUxPageHeroArt img{min-height:118px;max-height:118px}
}
`;
}
