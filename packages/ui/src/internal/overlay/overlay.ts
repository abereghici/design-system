import { useId, useLayoutEffect, useState } from "react";
import type { ComponentProps, FocusEvent, MouseEvent, ToggleEvent } from "react";

import { composeEventHandlers, dispatchFeedback, requestChange } from "../../events/events.ts";
import type { ChangeEventDetails as Details } from "../../events/events.ts";
import { getDocument, useEvent } from "../../events/use-event.ts";

type ChangeReason =
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

export interface OverlayOptions<Reason extends ChangeReason> {
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

/** What a Content part adds to the layer's own `beforetoggle` and `toggle` handling, which runs first. */
export type ContentHooks = Partial<
  Record<"onBeforeToggle" | "onToggle", (event: ToggleEvent<HTMLElement>) => void>
>;

type TriggerHandlers = Pick<
  ComponentProps<"button">,
  "onPointerDown" | "onKeyDown" | "onClick" | "onBlur"
>;

/** The Trigger: an invoker of the layer, so pressing it never light-dismisses the layer. */
function triggerPropsOf<Props extends TriggerHandlers>(
  props: Props,
  layer: ReturnType<typeof controlsOf> & { open: boolean; anchored: boolean },
) {
  return {
    ...props,
    commandfor: layer.contentId,
    command: "toggle-popover" as const,
    "aria-expanded": layer.open,
    onClick: composeEventHandlers(props.onClick, (event: MouseEvent<HTMLButtonElement>) => {
      if (layer.anchored) {
        event.preventDefault();
        layer.toggle(!layer.open, "trigger-press", event.nativeEvent);
      } else if (!layer.request(!layer.open, "trigger-press", event.nativeEvent)) {
        event.preventDefault();
      }
    }),
    onBlur: (event) => {
      props.onBlur?.(event);
      layer.focusOut(event.nativeEvent);
    },
  } satisfies TriggerHandlers;
}

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

/**
 * Where a layer opens from: the element it shows against, where focus returns once it closes
 * (given the layer and the opening's source), and whether a pointer opened it, for its motion.
 */
export interface Anchor {
  readonly source: (contentId: string) => Element | null;
  readonly returnTo: (content: HTMLElement, source: Element | null) => Element | null;
  readonly pointer: (source: Element | null) => boolean;
}

/** Its Trigger, the invoker. */
const invoker: Anchor = {
  source: invokerOf,
  returnTo: (_content, source) => source,
  pointer: (source) => source?.matches(":is(:focus-visible, :has(:focus-visible))") === false,
};

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

  return (
    document.getElementById(contentId)?.contains(next) !== true &&
    invokerOf(contentId)?.contains(next) !== true
  );
}

/** Remembers the open layer's last Escape or outside press, so its close reports the reason. */
function useInputRecord(contentId: string, open: boolean) {
  const record = (event: Event) => {
    const element = document.getElementById(contentId);

    if (element === null) return;

    if (event instanceof KeyboardEvent && event.key !== "Escape") return;

    const inside = event.target instanceof Node && element.contains(event.target);

    if (event instanceof PointerEvent && inside) return;

    layerOf(element).input = event;
  };

  const target = open ? getDocument : null;

  useEvent("keydown", record, target, true);
  useEvent("pointerdown", record, target, true);
  useEvent("pointerup", record, target, true);
}

function beforeToggle(options: Options, event: ToggleEvent<HTMLElement>, anchor: Anchor) {
  const element = event.currentTarget;
  const layer = layerOf(element);
  const opening = event.newState === "open";
  const reported = layer.pending;
  const { input } = opening ? {} : layer;
  const native = input instanceof PointerEvent ? "outside-press" : "none";
  const reason = reported ?? (input instanceof KeyboardEvent ? "escape-key" : native);

  layer.pending = undefined;
  layer.input = undefined;

  const accepted =
    reported !== undefined ||
    requestChange(options.onOpenChange, opening, reason, event.nativeEvent);

  if (!opening) {
    layer.closing = reason;
    layer.focusInside =
      document.activeElement === document.body || element.contains(document.activeElement);
  } else if (accepted) {
    const { source } = event.nativeEvent;
    const to = anchor.returnTo(element, source);

    layer.returnTo = to instanceof HTMLElement ? to : undefined;
    element.toggleAttribute("data-pointer", anchor.pointer(source));
  } else {
    event.preventDefault();
  }
}

function reconcile(contentId: string, open: boolean, findSource: (id: string) => Element | null) {
  const element = document.getElementById(contentId);

  if (element === null) return;

  const layer = layerOf(element);

  // `closing` lasts until the async `toggle` event (https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/toggle_event), so a render in
  // between (a value set on the closing press) does not reopen the layer.
  if (layer.pending !== undefined || layer.closing !== undefined || open === isOpen(element))
    return;

  layer.pending = "none";

  if (open) element.showPopover(sourceOf(findSource(contentId)));
  else element.hidePopover();
}

function contentPropsOf(
  id: string,
  { component, options, anchor }: { component: Component; options: Options; anchor: Anchor },
  setOpen: (open: boolean) => void,
  focusOut: (event: globalThis.FocusEvent) => void,
  hooks: ContentHooks = {},
) {
  return {
    id,
    popover: "auto",
    onBlur: (event: FocusEvent<HTMLElement>) => {
      focusOut(event.nativeEvent);
    },
    onBeforeToggle: (event: ToggleEvent<HTMLElement>) => {
      beforeToggle(options, event, anchor);
      hooks.onBeforeToggle?.(event);
    },
    onToggle: (event: ToggleEvent<HTMLElement>) => {
      setOpen(event.newState === "open");

      if (event.newState === "closed") settle(event.currentTarget, component);

      hooks.onToggle?.(event);
    },
  } as const;
}

/** The layer's changes: each one reaches `onOpenChange` before the browser acts on it. */
function controlsOf(
  contentId: string,
  options: Options,
  findSource: (id: string) => Element | null,
) {
  const request = (next: boolean, reason: ChangeReason, event?: Event) => {
    const element = document.getElementById(contentId);

    if (element === null || !requestChange(options.onOpenChange, next, reason, event)) return false;

    const layer = layerOf(element);

    layer.pending = reason;
    setTimeout(() => {
      if (layer.pending === reason) layer.pending = undefined;
    });

    return true;
  };

  const toggle = (next: boolean, reason: ChangeReason, event?: Event, source?: Element | null) => {
    const element = document.getElementById(contentId);

    if (element === null || isOpen(element) === next || !request(next, reason, event)) return false;

    if (next) element.showPopover(sourceOf(source ?? findSource(contentId)));
    else element.hidePopover();

    return true;
  };

  const focusOut = (event: globalThis.FocusEvent) => {
    if (!leaves(contentId, event.relatedTarget)) return;

    setTimeout(() => {
      toggle(false, "focus-out", event);
    });
  };

  return { contentId, request, toggle, focusOut };
}

/**
 * The open state of one `popover="auto"` layer, kept in step with the browser's own opens and
 * closes (commands, light dismiss, Escape) so each change reaches `onOpenChange` once. Its Trigger
 * and Content spread `triggerProps()` and `contentProps()`. A layer that opens from something
 * other than its Trigger passes that part of its `anchor`; with a `source`, the Trigger shows it
 * against that element. `component` names it in its `ab-dismiss`.
 */
export function useOverlay(component: Component, options: Options, anchor: Partial<Anchor> = {}) {
  const adapter = { ...invoker, ...anchor };
  const findSource = adapter.source;
  const [uncontrolled, setUncontrolled] = useState(options.defaultOpen ?? false);
  const current = options.open ?? uncontrolled;
  const contentId = useId();

  const controls = controlsOf(contentId, options, findSource);

  useInputRecord(contentId, current);

  useLayoutEffect(() => {
    reconcile(contentId, current, findSource);
  });

  return {
    open: current,
    contentId,
    request: controls.request,
    toggle: controls.toggle,
    contentProps: (hooks?: ContentHooks) =>
      contentPropsOf(
        contentId,
        { component, options, anchor: adapter },
        setUncontrolled,
        controls.focusOut,
        hooks,
      ),
    triggerProps: <Props extends TriggerHandlers>(props: Props) =>
      triggerPropsOf(props, { ...controls, open: current, anchored: anchor.source !== undefined }),
  };
}

export type Overlay = ReturnType<typeof useOverlay>;
