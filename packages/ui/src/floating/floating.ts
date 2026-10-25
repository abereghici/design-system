import { useEffect, useEffectEvent, useId, useLayoutEffect, useState } from "react";
import type { ToggleEvent } from "react";

import { dispatchFeedback } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";

export type ChangeReason =
  | "trigger-press"
  | "outside-press"
  | "escape-key"
  | "close-press"
  | "item-press"
  | "day-press"
  | "focus-out"
  | "none";

/**
 * `cancel()`: keeps the current state. It has no effect on Escape and outside presses: the browser
 * closes the popover itself and its closing `beforetoggle` cannot be cancelled.
 */
export type ChangeEventDetails<Reason extends ChangeReason = ChangeReason> = Details<
  Reason,
  Event | undefined
>;

export interface FloatingOptions<Reason extends ChangeReason> {
  /** Whether it is open, when your state holds it; pair it with `onOpenChange`. */
  open?: boolean | undefined;
  /** Opens it on the first render when it holds its own state. */
  defaultOpen?: boolean | undefined;
  /** Called before it opens or closes; `details.cancel()` keeps it as it is. */
  onOpenChange?: ((open: boolean, details: ChangeEventDetails<Reason>) => void) | undefined;
}

interface Options {
  readonly open?: boolean | undefined;
  readonly defaultOpen?: boolean | undefined;
  readonly onOpenChange?:
    | { bivariance(open: boolean, details: ChangeEventDetails): void }["bivariance"]
    | undefined;
}

type Component = "Popover" | "DropdownMenu" | "ContextMenu";

interface Layer {
  pending?: ChangeReason | undefined;
  closing?: ChangeReason | undefined;
  focusInside?: boolean;
  input?: Event | undefined;
  returnTo?: HTMLElement | undefined;
}

const layers = new WeakMap<Element, Layer>();

function layerOf(element: Element): Layer {
  const layer = layers.get(element) ?? {};
  layers.set(element, layer);
  return layer;
}

export const isOpen = (element: Element | null) => element?.matches(":popover-open") === true;

export const sourceOf = (source: Element | null): ShowPopoverOptions =>
  source instanceof HTMLElement ? { source } : {};

/** The element that opened the layer: commands and `showPopover({ source })` both record it. */
const invokerOf = (contentId: string) =>
  document.querySelector(`[commandfor="${CSS.escape(contentId)}"]`);

export const byId = (id: string) => document.querySelector<HTMLElement>(`#${CSS.escape(id)}`);

function report(options: Options, open: boolean, reason: ChangeReason, event?: Event): boolean {
  let cancelled = false;
  options.onOpenChange?.(open, {
    reason,
    event,
    cancel: () => {
      cancelled = true;
    },
  });
  return !cancelled;
}

function nativeReason(layer: Layer): ChangeReason {
  if (layer.input instanceof KeyboardEvent) return "escape-key";
  if (layer.input instanceof PointerEvent) return "outside-press";
  return "none";
}

function settle(element: HTMLElement, component: Component) {
  const layer = layerOf(element);
  const { closing, focusInside } = layer;
  layer.closing = undefined;
  if (closing === "escape-key" || closing === "outside-press") {
    dispatchFeedback(element, "ab-dismiss", { component, reason: "user" });
  }
  if (focusInside === true && closing !== "outside-press") returnFocus(element);
  layer.returnTo = undefined;
}

/**
 * Records where focus was before a press that may open the layer moved it (WebKit blurs on press).
 */
export function rememberFocus(contentId: string, focus = document.activeElement) {
  const element = byId(contentId);
  if (element !== null)
    layerOf(element).returnTo = focus instanceof HTMLElement ? focus : undefined;
}

/** Puts focus back where the layer was opened from, unless the user already moved it elsewhere. */
export function returnFocus(
  element: HTMLElement,
  to: Element | null | undefined = layerOf(element).returnTo,
) {
  const focus = document.activeElement;
  if (focus !== document.body && !element.contains(focus)) return;
  if (to instanceof HTMLElement) to.focus({ preventScroll: true });
}

function leaves(contentId: string, next: EventTarget | null) {
  if (!(next instanceof Node)) return false;
  return byId(contentId)?.contains(next) !== true && invokerOf(contentId)?.contains(next) !== true;
}

function recordInput(element: HTMLElement, focusOut: (event: FocusEvent) => void) {
  const record = (event: Event) => {
    if (event instanceof KeyboardEvent && event.key !== "Escape") return;
    const inside = event.target instanceof Node && element.contains(event.target);
    if (event instanceof PointerEvent && inside) return;
    layerOf(element).input = event;
  };
  const types = ["keydown", "pointerdown", "pointerup"] as const;
  for (const type of types) document.addEventListener(type, record, true);
  element.addEventListener("focusout", focusOut);
  return () => {
    for (const type of types) document.removeEventListener(type, record, true);
    element.removeEventListener("focusout", focusOut);
  };
}

function beforeToggle(options: Options, event: ToggleEvent<HTMLElement>, component: Component) {
  const element = event.currentTarget;
  const layer = layerOf(element);
  const opening = event.newState === "open";
  const reported = layer.pending;
  const reason = reported ?? (opening ? "none" : nativeReason(layer));
  layer.pending = undefined;
  layer.input = undefined;
  const accepted = reported !== undefined || report(options, opening, reason, event.nativeEvent);
  if (!opening) {
    layer.closing = reason;
    layer.focusInside =
      document.activeElement === document.body || element.contains(document.activeElement);
  } else if (accepted) {
    const { source } = event.nativeEvent;
    const from = component === "ContextMenu" ? (layer.returnTo ?? document.activeElement) : source;
    layer.returnTo = from instanceof HTMLElement ? from : undefined;
    const pointer = source instanceof HTMLElement && source.dataset["pointer"] !== undefined;
    element.toggleAttribute("data-pointer", pointer);
  } else {
    event.preventDefault();
  }
}

function reconcile(contentId: string, open: boolean, findSource: (id: string) => Element | null) {
  const element = byId(contentId);
  if (element === null) return;
  const layer = layerOf(element);
  // `closing` lasts until the async `toggle` event, so a render in between (a value set on the closing press) does not reopen the layer.
  if (layer.pending !== undefined || layer.closing !== undefined || open === isOpen(element))
    return;
  layer.pending = "none";
  if (open) element.showPopover(sourceOf(findSource(contentId)));
  else element.hidePopover();
}

function contentPropsOf(
  id: string,
  component: Component,
  options: Options,
  setOpen: (open: boolean) => void,
) {
  return {
    id,
    popover: "auto",
    onBeforeToggle: (event: ToggleEvent<HTMLElement>) => {
      beforeToggle(options, event, component);
    },
    onToggle: (event: ToggleEvent<HTMLElement>) => {
      setOpen(event.newState === "open");
      if (event.newState === "closed") settle(event.currentTarget, component);
    },
  } as const;
}

function claim(
  options: Options,
  element: Element,
  next: boolean,
  reason: ChangeReason,
  event?: Event,
) {
  if (!report(options, next, reason, event)) return false;
  const layer = layerOf(element);
  layer.pending = reason;
  setTimeout(() => {
    if (layer.pending === reason) layer.pending = undefined;
  });
  return true;
}

/**
 * The open state of one `popover="auto"` layer, kept in step with the browser's own opens and
 * closes (commands, light dismiss, Escape) so each change reaches `onOpenChange` once.
 */
export function useFloating(
  component: Component,
  options: Options,
  findSource: (contentId: string) => Element | null = invokerOf,
) {
  const [uncontrolled, setUncontrolled] = useState(options.defaultOpen ?? false);
  const current = options.open ?? uncontrolled;
  const contentId = useId();

  /** Reports a change the component is about to make; `false` when `onOpenChange` cancelled it. */
  const request = (next: boolean, reason: ChangeReason, event?: Event) => {
    const element = byId(contentId);
    return element !== null && claim(options, element, next, reason, event);
  };

  function toggle(next: boolean, reason: ChangeReason, event?: Event, source?: Element | null) {
    const element = byId(contentId);
    if (element === null || isOpen(element) === next || !request(next, reason, event)) return false;
    if (next) element.showPopover(sourceOf(source ?? findSource(contentId)));
    else element.hidePopover();
    return true;
  }

  /** Closes with `"focus-out"` once focus has landed outside the layer and its Trigger. */
  function focusOut(event: FocusEvent) {
    if (!leaves(contentId, event.relatedTarget)) return;
    setTimeout(() => {
      toggle(false, "focus-out", event);
    });
  }

  const onFocusOut = useEffectEvent(focusOut);
  useEffect(() => {
    const element = byId(contentId);
    return current && element !== null ? recordInput(element, onFocusOut) : undefined;
  }, [contentId, current]);

  useLayoutEffect(() => {
    reconcile(contentId, current, findSource);
  });

  const contentProps = contentPropsOf(contentId, component, options, setUncontrolled);
  return { open: current, contentId, request, toggle, focusOut, contentProps };
}

export type Floating = ReturnType<typeof useFloating>;
