---
"@abereghici/ui": minor
---

IconButton no longer takes `pressed`, `defaultPressed` or `onPressedChange`, and `IconButtonChangeEventDetails` is gone: an IconButton is an action. For an icon that stays on or off, write `<ToggleButton value="pin" aria-label="Pin"><PinIcon /></ToggleButton>`, which takes the same three props, shows the icon in a square and can join a ToggleButtonGroup. PasswordField's show-password toggle is now a ToggleButton, so its `ab-toggle` names `component: "ToggleButton"`.
