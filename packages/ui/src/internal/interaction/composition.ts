interface Targeted {
  readonly currentTarget: EventTarget;
}

const justComposed = new WeakSet<EventTarget>();

/** The input's `onCompositionEnd`: marks the input for `isComposing` until the next task. */
export function trackComposition({ currentTarget: input }: Targeted) {
  justComposed.add(input);
  setTimeout(() => {
    justComposed.delete(input);
  });
}

/**
 * Whether a keydown on an input with `trackComposition` belongs to an IME composition. WebKit runs
 * `compositionend` before the Enter keydown that confirms it, whose `isComposing` is then false
 * (WebKit bug 165004), so a keydown in the same task as `compositionend` counts too.
 */
export function isComposing(event: Targeted & { readonly nativeEvent: KeyboardEvent }) {
  return event.nativeEvent.isComposing || justComposed.has(event.currentTarget);
}
