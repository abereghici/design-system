import { useSyncExternalStore } from "react";

const subscribeToNothing = () => () => {};

/**
 * Whether React has hydrated: `false` in the server HTML and while hydrating, `true` from the next
 * render on. Only for an attribute swap that changes nothing on screen; a control that would change
 * its look when hydration completes is a mount gate, which ADR 0008 rejects.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}
