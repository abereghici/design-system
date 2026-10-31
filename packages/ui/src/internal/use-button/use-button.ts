import type { MouseEvent } from "react";

interface ButtonOptions<Target extends Element> {
  /** Disabled or busy: it stays focusable, is announced as unavailable, and presses do nothing. */
  readonly disabled: boolean;
  /** The press, run only while it isn't disabled; it calls the consumer's `onClick`. */
  readonly onClick: (event: MouseEvent<Target>) => void;
}

/**
 * A button's own props, which `mergeProps` merges under the consumer's. Keep the consumer's
 * `onClick` out of that merge: the `onClick` here runs it, so a disabled press reaches no one.
 */
export function useButton<Target extends Element>({ disabled, onClick }: ButtonOptions<Target>) {
  return {
    "aria-disabled": disabled ? true : undefined,
    onClick: (event: MouseEvent<Target>) => {
      // preventDefault also stops a submit or reset button from acting on its form.
      if (disabled) event.preventDefault();
      else onClick(event);
    },
  } as const;
}
