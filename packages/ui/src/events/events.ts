/**
 * Feedback events: bubbling, prefixed `CustomEvent`s that components dispatch from their root
 * element at a feedback moment, so an app can add sound or haptics with one listener near the
 * root, around server-rendered content too. The design system never plays sound itself.
 *
 * Shape follows Shoelace (`new CustomEvent(name, { bubbles: true, cancelable: false,
 * composed: true, ... })` plus `declare global { interface GlobalEventHandlersEventMap { ... } }`),
 * Web Awesome and Spectrum Web Components (docs/research/feedback-events-and-i18n.md).
 */

/**
 * Why the moment happened. `"user"`: the component reacted to an event it handles (a click, a
 * key press). `"programmatic"`: the design system caused the moment itself (spec #1, user story
 * 20), so apps can skip feedback the user didn't cause.
 */
export type FeedbackReason = "user" | "programmatic";

export interface FeedbackEventDetail<Component extends string = string> {
  /** The design system component that dispatched the event. */
  readonly component: Component;
  readonly reason: FeedbackReason;
}

/** A press that activated a button-like component. */
export type PressEvent = CustomEvent<FeedbackEventDetail<"Button">>;

declare global {
  // `DocumentEventMap`, `WindowEventMap` and `HTMLElementEventMap` extend this map in lib.dom, so
  // `addEventListener("ab-press", …)` is typed on every target (src/testing/listen.ts relies on it).
  interface GlobalEventHandlersEventMap {
    "ab-press": PressEvent;
  }
}

type FeedbackEventType = {
  [
    Type in keyof GlobalEventHandlersEventMap
  ]: GlobalEventHandlersEventMap[Type] extends CustomEvent<FeedbackEventDetail> ? Type : never;
}[keyof GlobalEventHandlersEventMap];

type DetailOf<Type extends FeedbackEventType> =
  GlobalEventHandlersEventMap[Type] extends CustomEvent<infer Detail> ? Detail : never;

/**
 * Dispatches a feedback event from `target`. Bubbling and composed, not cancelable: vetoing a
 * change belongs to the component's callbacks. Dispatch is synchronous, so a listener runs inside
 * the user's gesture (user activation) when the caller runs inside one.
 */
export function dispatchFeedback<Type extends FeedbackEventType>(
  target: EventTarget,
  type: Type,
  detail: DetailOf<Type>,
): void {
  target.dispatchEvent(
    new CustomEvent(type, { bubbles: true, cancelable: false, composed: true, detail }),
  );
}
