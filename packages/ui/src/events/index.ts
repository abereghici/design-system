// Re-exporting from events.ts brings its GlobalEventHandlersEventMap augmentation to consumers.
export type {
  FeedbackEventDetail,
  FeedbackReason,
  PressEvent,
  ToggleFeedbackEvent,
} from "./events.ts";
