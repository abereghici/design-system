---
status: accepted
---

# Date components speak Temporal, with a scoped polyfill as the one exception to ADR-0002

The design system's date components (DatePicker, Calendar, DateField, relative time) take and return Temporal types (`Temporal.PlainDate`, `Temporal.ZonedDateTime`) rather than `Date`, so their public API never has to break when the platform catches up. On 2026-10-23 webstatus.dev listed Temporal as Baseline "limited" (Chrome/Edge 144, Firefox 139, no Safari), below the ADR-0002 floor. If Safari still lacks it when the date phase starts, `temporal-polyfill` is loaded by those components only, as the single documented exception to ADR-0002, and removed once Temporal reaches Baseline. Rejected: `Date` plus `Intl` now (would force a breaking API change later) and dropping WebKit from the date components' tests.

## Decision at the start of phase 6 (2026-10-24, ticket #49)

Accepted, with the polyfill. Safari still lacks Temporal:

- webstatus.dev (https://api.webstatus.dev/v1/features/temporal, fetched 2026-10-24): `"baseline":{"status":"limited"}`, implementations `chrome` 144 (2026-01-13), `edge` 144 (2026-01-21), `firefox` 139 (2025-05-27); no `safari` or `safari_ios` entry.
- MDN browser-compat-data (`javascript/builtins/Temporal.json`, main branch, fetched 2026-10-24): `"safari": { "version_added": "preview" }`, `"safari_ios": { "version_added": false }`.
- caniuse (`features-json/temporal.json`, main branch, fetched 2026-10-24): Safari supported only in `TP` (Technology Preview); no iOS Safari version.

How the polyfill stays scoped:

- Only the date components' private shared module imports it, as the side-effect-free entry: `import { Temporal } from "temporal-polyfill"`. Its README: "Local side-effect-free import (ponyfill). Uses native if available". The global entry (`temporal-polyfill/global`) is never used, so no app global changes and nothing outside the date subpaths loads it.
- That entry supports Gregorian dates only (README: "The following entrypoints support the `iso8601` and `gregory` calendar systems only"), which is all the phase-6 specs need (`Temporal.PlainDate`, Gregorian display).
- Version: `temporal-polyfill` 1.0.6 (npm registry, 2026-10-24), as in docs/tech-stack.md.
- Removal: when webstatus.dev lists `temporal` as Baseline newly available, the import switches to the global `Temporal` and the dependency is deleted; the public types do not change.
