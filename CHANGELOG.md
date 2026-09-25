## 4.0.0 — canonical Energy V2 UX architecture

- makes RHI_ENERGY_PUBLIC_CONTRACT_V2 the sole Energy product-state entrypoint;
- introduces a normalized V2 store and pure selectors/projectors matching the Mobility architecture;
- removes all Energy V1 product-index and legacy script dependencies from product runtime;
- routes planning, overview, configuration, commands, activity and value through backend-owned V2 semantics;
- preserves Home Assistant refresh interaction state while allowing canonical truth to update;
- fails closed instead of reconstructing missing period-metering or physical-connection truth;
- adds hard anti-drift validation for V1 references and raw contract bypasses;
- requires and is tested against Energy E0.15.48;
- preserves zero accepted technical and feature debt.

## 3.99.0 — Gas insights

- adds Gas as the final Energy tab after Consumers, keeping electricity first;
- adds a dedicated Gas hero in the current house style;
- consumes the canonical gas_meter logical asset and gas.total_m3 / optional gas.flow_m3_h without frontend estimation;
- embeds Home Assistant's native Statistics Graph over the canonical total-increasing gas entity for gas history;
- adds gas meter health/source identity and a dedicated Gas visual fallback;
- adds release-blocking Gas navigation, hero, canonical-truth and HA-native-history coverage;
- preserves Energy E0.15.32 / R1.89.44_CONTRACT and zero accepted technical/feature debt.

## 3.98.1 — tab ownership and device visual coverage

- restores Energy → Solar as the actual Solar hardware/generation screen;
- gives Intelligence → Operational Planning its own execution-focused screen with no solar hardware inventory;
- audits every tab and adds canonical Energy/Mobility device images wherever a concrete device or asset is represented;
- preserves semantic icons for abstract system lanes, totals and evidence where a product picture would be misleading;
- replaces the blurred SolarEdge SE10K-RWB48 raster with crisp scalable artwork;
- adds a release-blocking cross-tab IA/device-visual regression gate;
- preserves Energy E0.15.32 / R1.89.44_CONTRACT and zero accepted technical/feature debt.

## 3.98.0 — Solar hardware hierarchy and product artwork

- removes Physical energy devices from Flow and keeps Flow focused on measured energy paths;
- keeps Tactical/Operational Planning free of hardware inventory and removes the misplaced Solar operational-overview spillover;
- makes Solar the canonical hardware/configuration experience with arrays/zones, inverter children, battery aggregate + children, and support devices;
- allows each solar array/zone to select its own representative SunPower or Jinko panel artwork;
- wires verified Energy product artwork into the type-safe visual catalog and keeps all device rendering contained and centered;
- removes dead flat-hardware helper code and adds release-blocking Solar IA coverage;
- preserves Energy E0.15.32 / R1.89.44_CONTRACT and zero accepted technical/feature debt.

## 3.97.1 — Home Battery contributor body sizing

- keeps the approved Home Battery hero unchanged;
- constrains physical battery contributor cards to compact bounded body geometry;
- renders contributor product artwork in a dedicated fixed visual frame with centered object-fit contain;
- keeps status, SoC, power, health and state explanation outside the image;
- adds tablet/phone containment rules and a regression gate for hero preservation;
- preserves Energy E0.15.32 / R1.89.44_CONTRACT and zero accepted technical/feature debt.

## 3.97.0 — logical-device visual catalog and picker

- adds a representative Energy image catalog partitioned by logical device type;
- maps backend profile/integration context to same-type representative defaults without adding visual semantics to backend profiles;
- adds a type-safe image picker and UX-local presentation preference persistence;
- prevents cross-type selection and keeps unknown profiles on same-type fallbacks;
- preserves producer-owned Mobility visual_ref precedence for flexible loads;
- routes shared asset rendering through one Energy asset visual resolver;
- adds owned contract coverage and visual-library governance documentation;
- shows solar panels, inverters and batteries as fact-driven product cards in Solar and reuses product visuals in Battery and Physical Flow;
- explains panel → inverter → Home Bus → battery/grid from measured flow while explicitly avoiding invented solar-versus-grid allocation;
- preserves Energy E0.15.32 / R1.89.44_CONTRACT and zero accepted technical/feature debt.

## 3.96.3 — canonical asset visuals everywhere

- preserves visual_ref and canonical source identity on Consumer Mix normalization;
- resolves Value consumer allocation back to the semantic Energy/Mobility asset before rendering;
- replaces technical consumer hashes with picture + human asset name whenever canonical identity is available;
- adds asset pictures to Pricing of flexible loads, Consumer allocation, disabled flexible-load cards and exception summaries;
- keeps visual_ref as the only cross-domain visual identity and uses package-local artwork only;
- adds release-blocking coverage for Value and consumer-allocation visual identity;
- preserves Energy E0.15.32 and zero accepted technical/feature debt.

## 3.96.2 — picture-first asset identity

- makes the canonical asset picture a default identity primitive wherever an Energy asset is rendered;
- shows Mobility asset artwork in Flexible Loads, Planning lane headers, planning summaries, planned-load rows, Outlook child rows and operational summaries;
- resolves only backend-published `visual_ref` through the existing package-local Energy visual resolver;
- falls back visibly to a domain icon only when no usable asset visual exists;
- adds release-blocking coverage so known visual assets cannot silently regress to text-only rendering;
- preserves Energy E0.15.32 / R1.89.44_CONTRACT and zero accepted technical/feature debt.

## 3.96.1 — cross-domain Mobility visual_ref rendering

- consume Mobility-owned `visual_ref` passed through Energy E0.15.32;
- package the required Mobility vehicle/charger artwork locally inside Energy UX;
- resolve vehicle appearance and charger identity without brand/model/display-name inference;
- render the canonical visual on active Flexible Load and Charging Connection cards;
- keep Energy UX independent from Mobility UX runtime paths and preserve zero accepted debt.

## 3.96.0 — canonical Energy asset context

- consume Energy Public Contract V2 asset profiles and property-publication evidence through the existing registry/gateway boundary;
- keep profile identity backend-owned, read-only and separate from UX artwork;
- remove Flexible Asset display-name/storage regex classification;
- remove power-threshold reconstruction of Flexible Asset operating state;
- expose backend-owned profile/publication context in the normalized Flexible Asset model;
- require Energy E0.15.31 while preserving the R1.89.44_CONTRACT compatibility surface and zero accepted debt.

## 3.95.4 — Flow and Metering hero family correction

- replaces the remaining legacy Flow hero with a dedicated Energy-family 2172×724 asset;
- replaces the remaining legacy Metering hero with a dedicated Energy-family 2172×724 asset;
- uses hero-safe composition with a quiet left copy zone and principal Energy subject on the right for correct template clipping;
- preserves the v3.95.3 Mobility-parity hero/status/actions layout and all Energy semantics;
- keeps E0.15.25 / R1.89.44_CONTRACT compatibility with zero backend contract delta.

## 3.95.3 — hero/status stacking correction

- fixes the remaining Energy layout drift where the hero and four status cards were still rendered side-by-side because an older two-column grid template survived the rc.38 override;
- explicitly forces the top-level header container to a single-column vertical stack;
- preserves the rc.38 hero, four-card status row, Quick Actions hierarchy, Energy semantics and HACS package structure;
- adds a regression check for the vertical hero → status composition.

## 3.95.2 — Mobility rc.38 visual parity closure

- locks Energy top-level composition to the Mobility rc.38 reference: hero → four status cards → quick actions → domain content;
- keeps hero content limited to eyebrow, title, description and artwork with no live mini-status inside the hero;
- keeps four top-level status cards across desktop/tablet and collapses to two columns only at phone width;
- aligns quick-action geometry, primary-action treatment, spacing and breakpoints with Mobility;
- adds a consistent action bar to Home Battery and fallback top-level views that previously had no actions;
- adds a cross-product visual-parity regression gate so this presentation contract cannot silently drift again;
- preserves Energy backend/domain contracts, HACS packaging and the existing hero image set.

## 3.95.1 — Mobility overview parity correction

- matches the Energy hero composition to Mobility Overview and removes hero-level mini status values;
- promotes Energy's four primary facts to the same top-level status-card hierarchy as Mobility Overview;
- aligns Quick Actions spacing and primary-action treatment with Mobility Overview;
- fixes semantic hero-image mapping across Flow, Solar, Metering, Planning, Strategy and Retrospective;
- preserves E0.15.25 / R1.89.44_CONTRACT compatibility with no backend contract change.

## 3.95.0 — Energy UX structural alignment

- aligns Energy page heroes with the proven Mobility header geometry and responsive behavior;
- freezes a dedicated Energy-first hero family across existing tabs;
- centralizes navigation, hero selection and presentation primitives in one declarative presentation module;
- gives current and compatibility views explicit presentation mappings instead of Overview fallback;
- standardizes compact fact, context and data-row card grammar without moving domain semantics into the frontend;
- preserves E0.15.25 / R1.89.44_CONTRACT compatibility with zero backend contract delta.

## 3.94.24 — HACS full-tree delivery correction

- Removes all GitHub Release assets from tagged HACS plugin releases.
- Fixes clean-install behavior where evidence-only attachments displaced the immutable tag `dist/` package.
- Makes zero release assets a hard publication and stable-promotion invariant.
- Makes HACS install simulation model actual tagged-release selection before installing `dist/`.
- Preserves 3.94.23 Energy runtime behavior and R1.89.44_CONTRACT.

## 3.94.23 — canonical source ownership and structured HACS package

- Removes duplicated generated module blocks from the Energy app source.
- Establishes explicit app/runtime/domain/assets ownership with manifest-owned insertion order.
- Makes `src/assets/` canonical and promotes hero artwork out of generated `dist/`.
- Rebuilds `dist/` from scratch and generates a runtime checksum plus `PACKAGE_MANIFEST.json`.
- Makes the immutable tag's complete `dist/` tree the HACS package; release assets become evidence-only.
- Adds source, asset, package, documentation and simulated-install drift gates.
- Keeps Energy semantics and public contracts unchanged.

## 3.94.22 — readable footer and cache-safe shared assets

- Makes the shared UX footer readable at 11px desktop / 10.5px phone with full opacity.
- Replaces hover-only errors with expandable issue details containing concrete runtime/backend conditions.
- Adds backend release/contract context and a verification action in the expanded footer.
- Adds package-version cache busting to the external company-logo URL to prevent stale Chrome logo rendering after HACS updates.
- Updates the shared footer/asset-refresh standard for parity with Mobility.

## 3.94.21 — shared UX release and footer governance

- Publishes TEST CANDIDATE versions as HACS-visible normal GitHub Releases rather than GitHub prereleases.
- Adds explicit release status and a cross-package UX release standard.
- Makes stable promotion evidence-only against the exact immutable candidate.
- Standardizes the compact footer contract across Energy and Mobility.
- Adds fail-closed release/footer drift validation.

## 3.94.20 — shared company-brand package

- applies the approved transparent Robotix logo with dark-blue company/building artwork and lighter-blue slogan;
- keeps one canonical brand asset with source/dist byte parity;
- routes runtime branding through one company-logo constant;
- adds portable `--rhi-company-*` sizing tokens for reuse across modules;
- expands validation to block recolouring, filters, embedded redraws and brand-asset drift;
- preserves the approved premium two-level header and compact gray secondary-navigation icons.

## 3.94.19 — canonical company branding

- replaces the synthetic Robotix logo with the approved supplied artwork geometry;
- establishes `source/assets/company-logo.svg` as the single brand authority;
- synchronizes source branding assets to distribution during the reproducible build;
- pins the approved brand hash and source/dist parity in validation;
- prevents runtime recolouring or synthetic redraws of the company mark;
- preserves the premium header and compact secondary navigation.

## 3.94.17 — product contract coherence

- renders physical Home Battery contributors from explicit backend-owned state and health;
- preserves signed battery flow semantics and never treats missing power as zero or Ready;
- labels Tactical Planning need and residuals by the selected D0/D1 horizon;
- consumes the E0.15.25 horizon-local Planning totals without frontend recomputation;
- activates existing Pricing edit/save/readback controls through the canonical public property-write contract;
- activates semantic Strategy profile editing for Home, Home Battery, Solar, Grid, Flexible Loads and Resilience;
- keeps UX presentation-only: all Energy semantics and writes remain backend-owned.

## 3.94.16 — approved premium navigation alignment

- moves Home Intelligence identity into the shared two-layer navigation card;
- gives the primary row more premium spacing, scale and hierarchy;
- adds restrained section icons without adding mockup-only product controls;
- keeps contextual tabs as a quieter second row inside the same frame;
- preserves routing, persistence, omni-device behaviour and backend contracts.

## 3.94.15 — lighter shared navigation frame

- places both navigation layers inside one premium low-contrast frame;
- removes separate nested navigation containers and their duplicate visual weight;
- keeps primary navigation quieter than contextual navigation;
- adds restrained Energy, Intelligence and Insights accent states;
- preserves the same two-layer information architecture and omni-device behaviour.

## 3.94.14 — two-level navigation and premium headers

- introduces Energy / Intelligence / Insights as the first navigation layer;
- introduces contextual second-layer tabs for each product area;
- reclassifies the existing Solar screen as Operational Planning and current Planning as Tactical Planning;
- adds structural Solar and Strategic Planning destinations without moving or inventing domain semantics;
- persists section/item navigation across card recreation and remembers the last location per section;
- standardises the visible premium banner directly under navigation across desktop, tablet and phone;
- removes the old large top title from the active page layout.

## 3.94.13 — Planning D1 totals contract closure

- consumes the dedicated backend Tomorrow/D1 planning totals instead of the combined D0+D1 summary;
- labels D1 aggregate planning values as Planned tomorrow;
- keeps canonical lane totals backend-owned and does not recompute flexible-load energy;
- requires Energy E0.15.24 for the dedicated D1 totals contract.

## 3.94.12 — lifecycle interaction-state stability

- restores stable UX navigation state after Home Assistant recreates the card;
- keeps runtime/edit/command feedback ephemeral;
- prevents restored Metering period from being rehydrated back to backend defaults;
- removes generic selector first-item fallback;
- aligns Consumers sort defaults;
- adds executable recreation and unavailable-selection regression coverage.

## 3.94.11 — interaction-state stability

- preserves active view and viewport across runtime updates;
- unifies Metering and Value period selection/write behavior;
- prevents recurring backend refresh from taking over the locally selected period;
- prevents silent Outlook horizon fallback and Strategy profile substitution;
- adds regression gates for interaction-state stability.

## 3.94.10 — canonical owner closure

- makes runtime property lookup fail closed on the Public Interface Registry owner;
- removes Consumer Mix reconstruction from Flexible Assets;
- routes product diagnostic interface identity through the registry;
- aligns Metering diagnostics with the canonical asset metering interface;
- adds architecture gates preventing cross-owner fallback drift.

## 3.94.9 — audit closure

- centralizes product entity identity in the Public Interface Registry;
- removes direct public-entity owner selection from runtime product paths;
- fixes Metering to use the canonical registry owner only;
- adds engineer handover and stronger documentation-governance checks;
- adds executable bundle-load smoke coverage;
- removes stale release labels and Home Base Load terminology from evergreen documentation.

# Changelog

## 3.94.8

Release/footer and HACS installation closure.

- shows only `RHI Energy UX <version> · Backend <release>` in quiet gray when healthy;
- shows colored issue text only when a runtime/interface problem exists;
- exposes technical error details only through the issue tooltip;
- reads the backend version only from `sensor.energy_release_contract.backend_release`;
- removes frontend fallback/mapping of backend release identity;
- adds foolproof HACS dashboard/resource migration instructions;
- keeps immutable GitHub releases and HACS version rollback.

## 3.94.7

Initial public HACS migration baseline of the existing R3.94.7 Energy UX.

- preserves R3.94.7 runtime and Energy contract semantics;
- moves deployment to a standard HACS Dashboard repository;
- packages runtime artwork under `dist/assets`;
- adds reproducible build and regression validation;
- adds GPL-3.0-only and compatibility metadata;
- adds immutable GitHub Release workflow for HACS update and rollback.
