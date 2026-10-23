---
status: proposed
---

# Date components speak Temporal, with a scoped polyfill as the one exception to ADR-0002

The design system's date components (DatePicker, Calendar, DateField, relative time) take and return Temporal types (`Temporal.PlainDate`, `Temporal.ZonedDateTime`) rather than `Date`, so their public API never has to break when the platform catches up. On 2026-10-23 webstatus.dev listed Temporal as Baseline "limited" (Chrome/Edge 144, Firefox 139, no Safari), below the ADR-0002 floor. If Safari still lacks it when the date phase starts, `temporal-polyfill` is loaded by those components only, as the single documented exception to ADR-0002, and removed once Temporal reaches Baseline. Rejected: `Date` plus `Intl` now (would force a breaking API change later) and dropping WebKit from the date components' tests.
