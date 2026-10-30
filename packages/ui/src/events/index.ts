// Re-exporting from events.ts brings its GlobalEventHandlersEventMap augmentation to consumers.
export type {
  AppearFeedbackEvent,
  ChangeEventDetails,
  ConfirmFeedbackEvent,
  DismissFeedbackEvent,
  FeedbackEventDetail,
  FeedbackReason,
  PressFeedbackEvent,
  ToggleFeedbackEvent,
} from "./events.ts";
