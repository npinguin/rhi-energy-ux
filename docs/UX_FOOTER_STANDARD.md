# RHI UX Footer Standard

This footer contract is normative across all Robotix Home Intelligence UX packages.

## Visible layout

Healthy state:

`RHI <Module> UX <version> · Backend <version>`

When there is an issue, one additional short issue label may appear in amber/red. Technical detail belongs in the tooltip, not as extra footer rows.

## Shared styling

Every package must expose the same structural classes:

- `.rhiUxFooter`
- `.rhiUxFooterIssue`

Canonical style tokens:

```css
.rhiUxFooter{
  display:flex;
  justify-content:center;
  align-items:center;
  flex-wrap:wrap;
  gap:4px 9px;
  margin:7px 3px 0;
  padding:4px 2px;
  border:0;
  background:transparent;
  color:#94a3b8;
  font-size:9px;
  font-weight:500;
  line-height:1.2;
  opacity:.82;
}
.rhiUxFooter span+span:before{content:"·";margin-right:9px;color:#cbd5e1}
.rhiUxFooterIssue{font-weight:650}
.rhiUxFooterIssue.warning{color:#b7791f}
.rhiUxFooterIssue.error{color:#b42318}
```

At phone width the footer may reduce to 8.5px and 7px separator spacing, but the information model must remain identical.

## Data ownership

- UX version comes from the UX package version/runtime constant.
- Backend version comes only from the module's canonical backend release contract.
- Healthy footer stays quiet gray.
- Diagnostics, runtime acceptance and technical details may influence the single issue label/tooltip but must not create module-specific visible footer structures.
- Missing backend identity must render `Unknown`; the UX must not invent or map a backend release.

## Drift rule

Module packages may change the module name only. They may not change footer geometry, colors, typography, separator behavior or healthy information structure without updating this shared standard across every UX package in the same release cycle.
