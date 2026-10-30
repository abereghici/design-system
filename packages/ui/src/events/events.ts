/**
 * Why the moment happened. `"user"`: the component reacted to an event it handles (a click, a
 * key press). `"programmatic"`: the design system caused the moment itself (spec #1, user story
 * 20), so apps can skip feedback the user didn't cause.
 */
export type FeedbackReason = "user" | "programmatic";

/** What an `on…Change` callback receives: why the change happened and the event behind it. */
export interface ChangeEventDetails<Reason extends string, Cause = Event> {
  readonly reason: Reason;
  readonly event: Cause;
  /** Keeps the previous state. */
  readonly cancel: () => void;
}

/** Calls `onChange` and answers whether the change was accepted: `false` once it calls `details.cancel()`. */
export function requestChange<Value, Reason extends string, Cause>(
  onChange: ((value: Value, details: ChangeEventDetails<Reason, Cause>) => void) | undefined,
  value: Value,
  reason: Reason,
  event: Cause,
): boolean {
  let accepted = true;

  onChange?.(value, {
    reason,
    event,
    cancel: () => {
      accepted = false;
    },
  });

  return accepted;
}

/**
 * Runs the consumer's handler, then ours unless it called `preventDefault()`. Only for events
 * whose native default is the change itself (an input's checkedness, a `<summary>` toggle, a
 * `commandfor` command): HTML runs no activation behavior for a canceled click, so ours mustn't
 * either.
 */
export function composeEventHandlers<Cause extends { defaultPrevented: boolean }>(
  consumer: ((event: Cause) => void) | undefined,
  own: (event: Cause) => void,
): (event: Cause) => void {
  return (event) => {
    consumer?.(event);

    if (!event.defaultPrevented) own(event);
  };
}

/** Marks pointer-initiated changes with `data-pointer`, so keyboard changes skip the motion. */
export const pointerMarker = {
  onPointerDown: (event: { readonly currentTarget: HTMLElement }) => {
    event.currentTarget.dataset["pointer"] = "";
  },
  onKeyDown: (event: { readonly currentTarget: HTMLElement }) => {
    delete event.currentTarget.dataset["pointer"];
  },
};

export interface Targeted {
  readonly currentTarget: EventTarget;
}

const justComposed = new WeakSet<EventTarget>();

/** The input's `onCompositionEnd`: runs `handler`, then marks the input for `isComposing` until the next task. */
export function trackComposition<Cause extends Targeted>(handler?: (event: Cause) => void) {
  return (event: Cause) => {
    handler?.(event);

    const input = event.currentTarget;

    justComposed.add(input);
    setTimeout(() => {
      justComposed.delete(input);
    });
  };
}

/**
 * Whether a keydown on an input with `trackComposition` belongs to an IME composition. WebKit runs
 * `compositionend` before the Enter keydown that confirms it, whose `isComposing` is then false
 * (WebKit bug 165004), so a keydown in the same task as `compositionend` counts too.
 */
export function isComposing(event: Targeted & { readonly nativeEvent: KeyboardEvent }) {
  return event.nativeEvent.isComposing || justComposed.has(event.currentTarget);
}

export interface FeedbackEventDetail<Component extends string = string> {
  readonly component: Component;
  readonly reason: FeedbackReason;
}

export type PressFeedbackEvent = CustomEvent<
  FeedbackEventDetail<"Button" | "IconButton" | "DropdownMenu" | "ContextMenu">
>;

/** Not `ToggleEvent`, which would shadow the DOM's popover and `<details>` event type. */
export type ToggleFeedbackEvent = CustomEvent<
  FeedbackEventDetail<
    | "IconButton"
    | "Checkbox"
    | "Switch"
    | "RadioGroup"
    | "Tabs"
    | "SegmentedControl"
    | "Accordion"
    | "DropdownMenu"
    | "ContextMenu"
  >
>;

export type DismissFeedbackEvent = CustomEvent<
  FeedbackEventDetail<
    | "Alert"
    | "Dialog"
    | "AlertDialog"
    | "Sheet"
    | "Popover"
    | "DropdownMenu"
    | "ContextMenu"
    | "Toast"
  >
>;

export type AppearFeedbackEvent = CustomEvent<FeedbackEventDetail<"Toast">>;

export type ConfirmFeedbackEvent = CustomEvent<
  FeedbackEventDetail<"AlertDialog" | "Toast" | "Command">
>;

declare global {
  // lib.dom's Document, Window and HTMLElement event maps extend this one, so every target is typed.
  interface GlobalEventHandlersEventMap {
    "ab-press": PressFeedbackEvent;
    "ab-toggle": ToggleFeedbackEvent;
    "ab-dismiss": DismissFeedbackEvent;
    "ab-appear": AppearFeedbackEvent;
    "ab-confirm": ConfirmFeedbackEvent;
  }
}

type FeedbackEventType = {
  [
    Type in keyof GlobalEventHandlersEventMap
  ]: GlobalEventHandlersEventMap[Type] extends CustomEvent<FeedbackEventDetail> ? Type : never;
}[keyof GlobalEventHandlersEventMap];

type DetailOf<Type extends FeedbackEventType> =
  GlobalEventHandlersEventMap[Type] extends CustomEvent<infer Detail> ? Detail : never;

// Synchronous, so a listener runs inside the user's gesture:
// https://html.spec.whatwg.org/multipage/interaction.html#tracking-user-activation
export function dispatchFeedback<Type extends FeedbackEventType>(
  target: EventTarget,
  type: Type,
  detail: DetailOf<Type>,
): void {
  target.dispatchEvent(
    new CustomEvent(type, { bubbles: true, cancelable: false, composed: true, detail }),
  );
}

/**
 * A `subscribe` (for `useSyncExternalStore` or an effect) that shares one `type` listener on
 * `target()` among every subscriber, so a page of instances adds one listener, not one each.
 */
export function sharedListener(type: string, target: () => EventTarget, capture = false) {
  const listeners = new Set<(event: Event) => void>();
  const notify = (event: Event) => {
    for (const listener of listeners) listener(event);
  };

  return (listener: (event: Event) => void) => {
    const entry = (event: Event) => {
      listener(event);
    };

    if (listeners.size === 0) target().addEventListener(type, notify, capture);

    listeners.add(entry);

    return () => {
      listeners.delete(entry);

      if (listeners.size === 0) target().removeEventListener(type, notify, capture);
    };
  };
}
