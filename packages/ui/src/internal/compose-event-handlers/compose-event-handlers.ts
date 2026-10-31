/**
 * Runs the consumer's handler, then ours unless it called `preventDefault()`, as Radix's
 * `composeEventHandlers` does. Only for events whose native default is the change itself (an
 * input's checkedness, a `<summary>` toggle, a `commandfor` command): HTML runs no activation
 * behavior for a canceled click, so ours mustn't either.
 */
export function composeEventHandlers<Cause extends { defaultPrevented: boolean }>(
  consumer: ((event: Cause) => void) | undefined,
  own: (event: Cause) => void,
): (event: Cause) => void {
  return (event) => {
    consumer?.(event);

    if (!event.defaultPrevented) own(event);
  };
}
