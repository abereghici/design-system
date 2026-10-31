/** Records the events of each of `types` that reach the document, in order, as an app's listener hears them, until `stop()`. */
export function listen<Type extends keyof DocumentEventMap>(...types: Type[]) {
  const events: DocumentEventMap[Type][] = [];
  const record = (event: DocumentEventMap[Type]) => {
    events.push(event);
  };

  for (const type of types) document.addEventListener(type, record);

  return {
    events,
    stop: () => {
      for (const type of types) document.removeEventListener(type, record);
    },
  };
}

/** Records every Feedback event that reaches the document, in order, until `stop()`. */
export const listenFeedback = () =>
  listen("ab-press", "ab-toggle", "ab-confirm", "ab-dismiss", "ab-appear");

/** What an app's change callback heard, in order: each value with its `details.reason`. */
export const reasons = (callback: { mock: { calls: [unknown, { reason: string }][] } }) =>
  callback.mock.calls.map(([value, { reason }]) => [value, reason]);
