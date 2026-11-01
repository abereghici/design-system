/**
 * A `subscribe` (for `useSyncExternalStore` or an effect) that shares one `type` listener on
 * `target()` among every subscriber, so a page of instances adds one listener, not one each.
 */
export function sharedListener(type: string, target: () => EventTarget, capture = false) {
  const listeners = new Set<(event: Event) => void>();
  const notify = (event: Event) => {
    for (const listener of listeners) listener(event);
  };

  return (listener: (event: Event) => void) => {
    const entry = (event: Event) => {
      listener(event);
    };

    if (listeners.size === 0) target().addEventListener(type, notify, capture);

    listeners.add(entry);

    return () => {
      listeners.delete(entry);

      if (listeners.size === 0) target().removeEventListener(type, notify, capture);
    };
  };
}
