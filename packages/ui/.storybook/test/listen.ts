/** Records the `type` events that reach the document, as an app's listener hears them, until `stop()`. */
export function listen<Type extends keyof DocumentEventMap>(type: Type) {
  const events: DocumentEventMap[Type][] = [];
  const record = (event: DocumentEventMap[Type]) => {
    events.push(event);
  };

  document.addEventListener(type, record);

  return {
    events,
    stop: () => {
      document.removeEventListener(type, record);
    },
  };
}

/** What an app's change callback heard, in order: each value with its `details.reason`. */
export const reasons = (callback: { mock: { calls: [unknown, { reason: string }][] } }) =>
  callback.mock.calls.map(([value, { reason }]) => [value, reason]);
