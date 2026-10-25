import type { KeyboardEvent } from "react";

// WebKit doesn't swap Left and Right for native radios in RTL (Chromium and Firefox do). Inside a Toolbar the Toolbar owns the arrow keys.
export function followVisualDirection(event: KeyboardEvent<HTMLElement>) {
  const step = event.key === "ArrowLeft" ? 1 : event.key === "ArrowRight" ? -1 : 0;
  const group = event.currentTarget;
  if (step === 0 || event.defaultPrevented || !group.matches(":dir(rtl)")) return;
  if (group.closest('[role="toolbar"]') !== null) return;
  if (!(event.target instanceof HTMLInputElement)) return;
  event.preventDefault();
  const radios = [...group.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
  const next = radios.at((radios.indexOf(event.target) + step) % radios.length);
  next?.focus();
  next?.click();
}
