/**
 * Why the moment happened. `"user"`: the component reacted to an event it handles (a click, a
 * key press). `"programmatic"`: the design system caused the moment itself (spec #1, user story
 * 20), so apps can skip feedback the user didn't cause.
 */
export type FeedbackReason = "user" | "programmatic";

export interface FeedbackEventDetail<Component extends string = string> {
  readonly component: Component;
  readonly reason: FeedbackReason;
}

export type PressEvent = CustomEvent<FeedbackEventDetail<"Button" | "IconButton">>;

/** Not `ToggleEvent`, which would shadow the DOM's popover and `<details>` event type. */
export type ToggleFeedbackEvent = CustomEvent<
  FeedbackEventDetail<
    "IconButton" | "Checkbox" | "Switch" | "RadioGroup" | "Tabs" | "SegmentedControl" | "Accordion"
  >
>;

export type DismissEvent = CustomEvent<
  FeedbackEventDetail<"Alert" | "Dialog" | "AlertDialog" | "Sheet">
>;

export type ConfirmEvent = CustomEvent<FeedbackEventDetail<"AlertDialog">>;

declare global {
  // lib.dom's Document, Window and HTMLElement event maps extend this one, so every target is typed.
  interface GlobalEventHandlersEventMap {
    "ab-press": PressEvent;
    "ab-toggle": ToggleFeedbackEvent;
    "ab-dismiss": DismissEvent;
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
