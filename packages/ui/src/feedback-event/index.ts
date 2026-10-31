// Re-exporting from feedback-event.ts brings its GlobalEventHandlersEventMap augmentation to consumers.
export type {
  AppearFeedbackEvent,
  ConfirmFeedbackEvent,
  DismissFeedbackEvent,
  FeedbackEventDetail,
  PressFeedbackEvent,
  ToggleFeedbackEvent,
} from "./feedback-event.ts";
