---
"@abereghici/ui": minor
---

`@abereghici/ui/events` is now `@abereghici/ui/feedback-event` and holds only the Feedback event types (`PressFeedbackEvent`, `ToggleFeedbackEvent`, `DismissFeedbackEvent`, `AppearFeedbackEvent`, `ConfirmFeedbackEvent`, `FeedbackEventDetail`). A Feedback event's `detail.reason` (`"user"` or `"programmatic"`) is now `detail.userInitiated` (`true` or `false`), as the Navigation API's `NavigateEvent.userInitiated` is, and `FeedbackReason` is gone. The generic `ChangeEventDetails` is no longer exported: type an `on…Change` callback with its Component's own type, such as `CheckboxChangeEventDetails`, which is unchanged.
