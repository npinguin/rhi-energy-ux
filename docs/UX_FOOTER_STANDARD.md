# RHI UX Footer Standard

This footer contract is normative across all Robotix Home Intelligence UX packages.

## Visible layout

Healthy state:

`RHI <Module> UX <version> · Backend <version>`

The footer must remain readable at normal desktop/tablet distance. Canonical text size is 11px desktop and 10.5px phone; opacity must remain 1.

When there is an issue, the footer shows one amber/red summary such as `2 issues · details`. It must be directly expandable/clickable. Hover-only disclosure is not sufficient.

Expanded issue details must show the concrete runtime/backend conditions that triggered the summary, plus enough backend/contract context to act on the problem. The footer must not hide actionable information in a title attribute only.

## Shared styling

Every package must expose the same structural classes:

- `.rhiUxFooter`
- `.rhiUxFooterIssue`
- `.rhiUxFooterDetails`
- `.rhiUxFooterPanel`
- `.rhiUxFooterProblem`
- `.rhiUxFooterAction`

Healthy footer styling is quiet but readable: `#64748b`, 11px, weight 520, opacity 1. Warning is `#9a6700`; error is `#b42318`.

## Data ownership

- UX version comes from the UX package version/runtime constant.
- Backend version comes only from the module's canonical backend release contract.
- Missing backend identity renders `Unknown`; UX never invents or maps a backend version.
- Issue summary is presentation-only; concrete issue content must come from runtime/backend diagnostics already owned by that module.
- Expanded details may add a generic verification instruction, but must not fabricate a remediation specific to a backend fault that is not known.

## Asset refresh contract

Externally loaded shared brand assets must use a package-versioned URL, for example `company-logo.svg?v=<UX_VERSION>`. This prevents an already-open browser profile from reusing a stale immutable-looking asset URL after a HACS package update/reload. The underlying canonical asset remains unchanged and cacheable within one package version.

## Drift rule

Module packages may change the module name and module-owned issue text only. Footer geometry, colors, typography, disclosure behavior and asset-versioning behavior must change across every UX package in the same release cycle.
