/** Calls each callback in order with the same arguments, skipping missing ones, as React Aria's `chain` does. */
export function chain<Args extends unknown[]>(
  ...callbacks: ReadonlyArray<((...args: Args) => unknown) | undefined>
): (...args: Args) => void {
  return (...args) => {
    for (const callback of callbacks) callback?.(...args);
  };
}
