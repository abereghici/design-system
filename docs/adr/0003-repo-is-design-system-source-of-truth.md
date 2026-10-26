# The repo is the design system's source of truth; the claude.ai artifact is a mirror

The Bereghici design system began life as a claude.ai Design System artifact, but from now on `packages/tokens` and `packages/ui` own every token, component and guideline, and the artifact is republished from them with `/design-sync` (code → artifact only; a synced artifact is read-only). Keeping two editable copies would drift, and only the repo can enforce the tier rules, contrast checks and tests. Brand-book or component changes made in the artifact are therefore lost on the next sync: make them in the repo.

**Mirror parked (2026-10-24).** The artifact mirror is parked until `/design-sync` can target artifacts.
