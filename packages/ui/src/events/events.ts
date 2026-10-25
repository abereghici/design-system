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

export interface FeedbackEventDetail<Component extends string = string> {
  readonly component: Component;
  readonly reason: FeedbackReason;
}

export type PressEvent = CustomEvent<
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

export type DismissEvent = CustomEvent<
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

export type AppearEvent = CustomEvent<FeedbackEventDetail<"Toast">>;

export type ConfirmEvent = CustomEvent<FeedbackEventDetail<"AlertDialog" | "Toast" | "Command">>;

declare global {
  // lib.dom's Document, Window and HTMLElement event maps extend this one, so every target is typed.
  interface GlobalEventHandlersEventMap {
    "ab-press": PressEvent;
    "ab-toggle": ToggleFeedbackEvent;
    "ab-dismiss": DismissEvent;
    "ab-appear": AppearEvent;
    "ab-confirm": ConfirmEvent;
  }
}

type FeedbackEventType = {
  [
    Type in keyof GlobalEventHandlersEventMap
  ]: GlobalEventHandlersEventMap[Type] extends CustomEvent<FeedbackEventDetail> ? Type : never;
}[keyof GlobalEventHandlersEventMap];

type DetailOf<Type extends FeedbackEventType> =
  GlobalEventHandlersEventMap[Type] extends CustomEvent<infer Detail> ? Detail : never;

// Synchronous, so a listener runs inside the user's gesture (user activation).
export function dispatchFeedback<Type extends FeedbackEventType>(
  target: EventTarget,
  type: Type,
  detail: DetailOf<Type>,
): void {
  target.dispatchEvent(
    new CustomEvent(type, { bubbles: true, cancelable: false, composed: true, detail }),
  );
}
