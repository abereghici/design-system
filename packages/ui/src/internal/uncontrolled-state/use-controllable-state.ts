import { useState } from "react";

import { requestChange } from "../change-request/change-request.ts";
import type { ChangeEventDetails } from "../change-request/change-request.ts";
import { useEvent } from "../dom-event/use-event.ts";
import type { EventTargetSource } from "../dom-event/use-event.ts";

/**
 * A value the app holds (`value`) or leaves to the Component (`defaultValue`), as Radix's and
 * Chakra's `useControllableState` do. `change` requests the change from `onChange` first and keeps
 * it unless the app cancelled it, which it reports as `false`; `set` keeps a value without asking.
 * The reset of `form`, found as `useEvent` finds its target, brings back `defaultValue`. A change
 * may be narrower than the value it replaces (`string[]` for `ReadonlyArray<string>`).
 */
export function useControllableState<Value, Next extends Value, Reason extends string, Cause>(
  value: Value | undefined,
  defaultValue: Value,
  onChange?: (value: Next, details: ChangeEventDetails<Reason, Cause>) => void,
  form: EventTargetSource = null,
) {
  const [own, set] = useState(defaultValue);

  useEvent(
    "reset",
    () => {
      set(defaultValue);
    },
    form,
  );

  function change(next: Next, reason: Reason, event: Cause) {
    const accepted = requestChange(onChange, next, reason, event);

    if (accepted) set(next);

    return accepted;
  }

  // Only `undefined` leaves the value to the Component: `null` is one the app holds, such as no date.
  if (value !== undefined) return [value, change, set] as const;

  return [own, change, set] as const;
}
