export interface FeedbackEventDetail<Component extends string = string> {
  readonly component: Component;
  /**
   * `true` when the component reacted to an event it handles (a click, a key press); `false` when
   * the design system caused the moment itself, so apps can skip feedback the user didn't cause.
   */
  readonly userInitiated: boolean;
}

export type PressFeedbackEvent = CustomEvent<
  FeedbackEventDetail<"Button" | "IconButton" | "DropdownMenu" | "ContextMenu">
>;

/** Not `ToggleEvent`, which would shadow the DOM's popover and `<details>` event type. */
export type ToggleFeedbackEvent = CustomEvent<
  FeedbackEventDetail<
    | "Checkbox"
    | "Switch"
    | "RadioGroup"
    | "Tabs"
    | "ToggleButton"
    | "SegmentedControl"
    | "Accordion"
    | "Disclosure"
    | "Table"
    | "DropdownMenu"
    | "ContextMenu"
    | "Splitter"
    | "Tree"
    | "Sidebar"
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
    | "DatePicker"
    | "DateRangePicker"
    | "TagGroup"
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
