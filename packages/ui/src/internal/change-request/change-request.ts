/** What an `on…Change` callback receives: why the change happened and the event behind it. */
export interface ChangeEventDetails<Reason extends string, Cause = Event> {
  readonly reason: Reason;
  readonly event: Cause;
  /** Keeps the previous state. */
  readonly cancel: () => void;
}

/** Calls `onChange` and answers whether the change was accepted: `false` once it calls `details.cancel()`. */
export function requestChange<Value, Reason extends string, Cause>(
  onChange: ((value: Value, details: ChangeEventDetails<Reason, Cause>) => void) | undefined,
  value: Value,
  reason: Reason,
  event: Cause,
): boolean {
  let accepted = true;

  onChange?.(value, {
    reason,
    event,
    cancel: () => {
      accepted = false;
    },
  });

  return accepted;
}
