# RHI Energy UX v4.3.6 — TEST CANDIDATE

## Runtime render closure

- fixes the central `assetVisual()` renderer so it acquires the current Energy runtime explicitly instead of referencing an undeclared free-scoped `rt`;
- restores Solar, Home Battery, Consumers and Gas render paths that failed in v4.3.5 when they rendered asset visuals;
- preserves the Foundation-registry-driven cross-domain visual architecture introduced in v4.3.5;
- adds an active regression gate preventing free-scoped runtime access from returning;
- preserves all existing Energy tabs, navigation, Details and Diagnostics depth.

## Required package set

- RHI UX Core **1.5.1** at `bb275767d9e9672713c00b9e8bd9fde13b9b5962`;
- Foundation **F1.8.25+**;
- Energy backend **E0.15.71+**; tested with **E0.15.72**;
- Mobility backend **M0.10.19+** for Mobility producer visuals.

Rollback: **v4.3.5**.

Target Home Assistant qualification remains mandatory. The exact runtime failure shown on Solar, Home Battery, Consumers and Gas in v4.3.5 is a mandatory 4.3.6 regression check.
