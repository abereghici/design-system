// Public entry of `@platform/ui/events`: the event types apps listen for. Re-exporting from
// events.ts also brings its `GlobalEventHandlersEventMap` augmentation into the consumer's program.
// `dispatchFeedback` stays internal: only components dispatch feedback events.
export type { FeedbackEventDetail, FeedbackReason, PressEvent } from "./events.ts";
