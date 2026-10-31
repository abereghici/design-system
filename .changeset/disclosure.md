---
"@abereghici/ui": minor
"@abereghici/tokens": minor
---

Add Disclosure (`@abereghici/ui/disclosure`): one section a Trigger shows and hides, on `<details>` and `<summary>`, so it works before hydration and find-in-page opens it. `open` / `defaultOpen` / `onOpenChange` take a change request, and every press dispatches a bubbling `ab-toggle`. Its tokens ship in `@abereghici/tokens/components/disclosure.css`. Accordion's Items are now Disclosures, with no visible change; Accordion's tokens still restyle them, and `Accordion.Trigger` now requires its text in `children`, as `Disclosure.Trigger` does.
