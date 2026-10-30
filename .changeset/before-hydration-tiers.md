---
"@abereghici/ui": patch
---

Name and describe Dialog, AlertDialog and Sheet from the server HTML, so they are announced before hydration. With scripting off, hide the controls only script can run: Alert's dismiss button, Calendar's month buttons, DatePicker's calendar button, NumberField's step buttons, PasswordField's show-password toggle and every tab but the selected one. Each Component's description now states its before-hydration tier.
