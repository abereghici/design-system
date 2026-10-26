import type { RefObject } from "react";

import { dispatchFeedback, requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { returnFocus } from "../floating/floating.ts";

declare global {
  // Baseline newly available (2026-05-11) but not yet in TypeScript's DOM lib:
  // https://html.spec.whatwg.org/#dom-toggleevent-source
  interface ToggleEvent {
    readonly source: Element | null;
  }
}

export type Reason = "trigger-press" | "outside-press" | "escape-key" | "close-press" | "none";

/** `cancel()`: keeps the current state. The browser may not let a repeated Escape be cancelled. */
export type ChangeEventDetails<R extends Reason = Reason> = Details<R>;

export interface Pending {
  readonly reason: Reason;
  readonly event: Event;
  readonly dismiss: Element | null;
}

export interface Options {
  readonly open: boolean | undefined;
  readonly onOpenChange: ((open: boolean, details: ChangeEventDetails) => void) | undefined;
  readonly component: "Dialog" | "AlertDialog" | "Sheet";
  readonly initialFocus: RefObject<HTMLElement | null> | undefined;
}

function outside(dialog: HTMLDialogElement, { target, clientX, clientY }: MouseEvent): boolean {
  const box = dialog.getBoundingClientRect();

  return (
    target === dialog &&
    (clientX < box.left || clientX > box.right || clientY < box.top || clientY > box.bottom)
  );
}

/**
 * One `<dialog>`'s bookkeeping between its native events: which gesture asked for a close, and
 * which toggles the component caused itself (they report nothing).
 */
export class Controller {
  #pending: Pending | null = null;
  #internal = false;
  #skipClose = false;
  #pointer = false;
  #opener: Element | null = null;
  #pressedOutside = false;

  press(pending: Pending): void {
    this.#pending = pending;
  }

  keyDown(dialog: HTMLDialogElement, event: KeyboardEvent): void {
    if (event.key === "Escape") this.#pending = { reason: "escape-key", event, dismiss: dialog };
  }

  pointerDown(dialog: HTMLDialogElement, event: MouseEvent): void {
    this.#pressedOutside = outside(dialog, event);
  }

  click(dialog: HTMLDialogElement, event: MouseEvent, options: Options): void {
    if (options.component === "AlertDialog" || !this.#pressedOutside || !outside(dialog, event)) {
      return;
    }

    this.#pending = { reason: "outside-press", event, dismiss: dialog };
    dialog.requestClose();
  }

  sync(dialog: HTMLDialogElement | null, open: boolean): void {
    if (dialog === null || open === dialog.open) return;

    this.#internal = true;

    if (open) dialog.showModal();
    else dialog.close();
  }

  beforeToggle(dialog: HTMLDialogElement, event: ToggleEvent, options: Options): void {
    const internal = this.#internal;

    this.#internal = false;

    if (event.newState === "closed") {
      this.#skipClose ||= internal;

      return;
    }

    if (!internal) {
      // A pointer press leaves the Trigger without :focus-visible; Safari doesn't focus it at all
      // (https://webkit.org/b/22261).
      this.#pointer = event.source !== null && !event.source.matches(":focus-visible");
      this.#opener = event.source;
    }

    dialog.toggleAttribute("data-pointer", this.#pointer);
    options.initialFocus?.current?.setAttribute("autofocus", "");

    if (internal) {
      this.#pointer = false;

      return;
    }

    const reason = event.source === null ? "none" : "trigger-press";

    if (!requestChange(options.onOpenChange, true, reason, event) || options.open !== undefined)
      event.preventDefault();
  }

  cancel(dialog: HTMLDialogElement, event: Event, options: Options): void {
    const {
      reason,
      event: cause,
      dismiss,
    } = this.#pending ?? {
      reason: "escape-key",
      event,
      dismiss: dialog,
    };

    this.#pending = null;

    const accepted = requestChange(options.onOpenChange, false, reason, cause);

    if (!accepted || options.open !== undefined) event.preventDefault();

    if (!event.defaultPrevented) this.#skipClose = true;

    if (accepted && dismiss !== null) {
      dispatchFeedback(dismiss, "ab-dismiss", { component: options.component, reason: "user" });
    }
  }

  close(dialog: HTMLDialogElement, event: Event, options: Options): void {
    options.initialFocus?.current?.removeAttribute("autofocus");
    this.#pending = null;

    if (this.#skipClose) this.#skipClose = false;
    else requestChange(options.onOpenChange, false, "none", event);

    // WebKit doesn't focus a clicked button (https://webkit.org/b/22261), so its close steps leave
    // focus on <body> or in the closed dialog.
    returnFocus(dialog, this.#opener);
    this.#opener = null;
  }
}
