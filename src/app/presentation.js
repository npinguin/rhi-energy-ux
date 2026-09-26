// Energy presentation grammar.
// Owns navigation metadata, tab hero assets, shared visual hierarchy and card primitives.
// Domain semantics, calculations, actions and runtime truth remain backend/domain owned.

const HB_ENERGY_NAVIGATION = Object.freeze([
  {
    id: "energy",
    label: "Energy",
    items: [
      { id:"overview", label:"Overview", view:"overview", title:"Energy Overview", description:"Your home energy system at a glance." },
      { id:"flow", label:"Flow", view:"flow", title:"Energy Flow", description:"See where energy is flowing right now." },
      { id:"solar", label:"Solar", view:"solar", title:"Solar", description:"Solar generation, arrays, inverters and the relationship with storage." },
      { id:"battery", label:"Home Battery", view:"battery", title:"Home Battery", description:"Storage state, capacity and contribution to the home." },
      { id:"consumers", label:"Consumers", view:"consumers", title:"Consumers", description:"Where energy is used and which loads are controllable." },
      { id:"gas", label:"Gas", view:"gas", title:"Gas", description:"Gas consumption, history and meter health." }
    ]
  },
  {
    id: "intelligence",
    label: "Intelligence",
    items: [
      { id:"strategy", label:"Strategy", view:"strategies", title:"Strategy", description:"Strategy overview, effective policy and current runtime state." },
      { id:"operational-planning", label:"Operational Planning", view:"operational-planning", title:"Operational Planning", description:"What should happen now and in the next hours." },
      { id:"tactical-planning", label:"Tactical Planning", view:"planning", title:"Tactical Planning", description:"How energy is allocated across today and tomorrow." },
      { id:"strategic-planning", label:"Strategic Planning", view:"strategic-planning", title:"Strategic Planning", description:"Longer-term energy goals, constraints and optimisation." }
    ]
  },
  {
    id: "insights",
    label: "Insights",
    items: [
      { id:"metering", label:"Metering", view:"metering", title:"Metering", description:"Measured energy for the selected period." },
      { id:"value", label:"Value", view:"value", title:"Value", description:"Financial impact of your energy system." },
      { id:"retrospective", label:"Retrospective", view:"retrospective", title:"Retrospective", description:"How Home Intelligence performed and what can improve." }
    ]
  }
]);

const HB_ENERGY_HERO_ASSETS = Object.freeze({
  overview: "heroes/overview-hero.webp",
  flow: "heroes/flow-hero.webp",
  solar: "heroes/solar-hero.webp",
  "solar-generation": "heroes/solar-hero.webp",
  battery: "heroes/battery-hero.webp",
  consumers: "heroes/consumers-hero.webp",
  gas: "heroes/gas-hero.webp",
  strategy: "heroes/strategies-hero.webp",
  strategies: "heroes/strategies-hero.webp",
  intelligence: "heroes/intelligence-hero.webp",
  "operational-planning": "heroes/planning-hero.webp",
  outlook: "heroes/outlook-hero.webp",
  "tactical-planning": "heroes/planning-hero.webp",
  planning: "heroes/planning-hero.webp",
  "strategic-planning": "heroes/strategies-hero.webp",
  metering: "heroes/metering-hero.webp",
  value: "heroes/value-hero.webp",
  retrospective: "heroes/diagnostics-hero.webp"
});

const HB_ENERGY_PROFILE_ALIASES = Object.freeze({
  "solar-generation": "solar",
  planning: "outlook",
  "strategic-planning": "strategies"
});

function hbEnergyAssetUrl(relativePath = "") {
  const normalized = String(relativePath || "").replace(/^\/+/, "");
  return `/hacsfiles/rhi-energy-ux/assets/${normalized}?v=${encodeURIComponent(UX_VERSION)}`;
}

function hbEnergyHeroAsset(tab = "overview") {
  return hbEnergyAssetUrl(HB_ENERGY_HERO_ASSETS[tab] || HB_ENERGY_HERO_ASSETS.overview);
}

function hbEnergyProfileKey(tab = "overview") {
  return HB_ENERGY_PROFILE_ALIASES[tab] || tab;
}

function hbEnergyPresentationStyles() {
  return `${rhiUxCoreStyles()}
    :host{
      /* Transitional aliases for domain-local styles. Shared primitives use --rhi-* directly. */
      --rhi-line:var(--rhi-color-line);
      --rhi-ink:var(--rhi-color-text);
      --rhi-muted:var(--rhi-color-muted);
      --rhi-blue:var(--rhi-color-primary);
      --rhi-surface:var(--rhi-color-surface);
      --rhi-soft:var(--rhi-color-surface-soft);
      --rhi-shadow:var(--rhi-shadow-md);
      --rhi-card-gap:var(--rhi-space-2);
    }
    .rhiEnergyNav-intelligence .rhiUxDomainShell{--rhi-nav-active-bg:#F1EDFF;--rhi-nav-active-border:#DFD5FB;--rhi-nav-active-text:#5A38B3}
    .rhiEnergyNav-insights .rhiUxDomainShell{--rhi-nav-active-bg:#E7F7F4;--rhi-nav-active-border:#CDEBE6;--rhi-nav-active-text:#176E67}
    .rhiEnergyPageHeader{display:block;margin:0 0 10px}
    .rhi-context-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--rhi-space-2)}
    .rhi-context-card{min-width:0;border:1px solid var(--rhi-color-line);border-radius:var(--rhi-radius-lg);background:var(--rhi-color-surface);box-shadow:var(--rhi-shadow-sm);padding:14px 16px}
    .rhi-data-list{display:grid;gap:6px}
    .rhi-data-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:9px 10px;border:1px solid #EDF1F6;border-radius:var(--rhi-radius-sm);background:var(--rhi-color-surface-soft)}
    @media(max-width:760px){.rhi-context-grid{grid-template-columns:1fr}}
  `;
}
