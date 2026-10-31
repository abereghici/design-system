import { useSyncExternalStore } from "react";

import { sharedListener } from "../internal/dom-event/shared-listener.ts";

// `toggle` does not bubble; a capturing listener on document still sees every dialog's:
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/toggle_event
const onToggle = sharedListener("toggle", () => document, true);

let modals: readonly HTMLDialogElement[] = [];

function subscribeModals(listener: () => void) {
  if (modals.length === 0)
    modals = [...document.querySelectorAll<HTMLDialogElement>("dialog:modal")];

  return onToggle(({ target }) => {
    if (!(target instanceof HTMLDialogElement)) return;

    const rest = modals.filter((dialog) => dialog !== target);

    modals = target.matches(":modal") ? [...rest, target] : rest;
    listener();
  });
}

/** The modal dialog on top, which the Toaster portals into so toasts stay usable. */
export const useTopmostModal = () =>
  useSyncExternalStore(
    subscribeModals,
    () => modals.at(-1) ?? null,
    () => null,
  );
