import { useState } from "react";

import type { ChangeEventDetails as Details } from "../../events/events.ts";
import { useControllableState } from "../../events/use-controllable-state.ts";
import { useEvent } from "../../events/use-event.ts";
import type { EventTargetSource } from "../../events/use-event.ts";

import { same } from "./segments.ts";
import type { Comparable, SegmentModel, Segments } from "./segments.ts";

export type Reason = "input-change" | "keyboard";

/** `cancel()`: keeps the previous segments. */
export type SegmentFieldChangeEventDetails = Details<Reason>;

export type Buffer<Part extends string> = { readonly part: Part; readonly text: string } | null;

export interface ValueOptions<Value> {
  readonly value?: Value | null | undefined;
  readonly defaultValue?: Value | null | undefined;
  readonly onValueChange?:
    | ((value: Value | null, details: SegmentFieldChangeEventDetails) => void)
    | undefined;
}

/**
 * The committed value and the segments being edited; an edit that changes the value is a change
 * request. The reset of `form` brings back the segments of the value the reset leaves.
 */
export function useSegmentValue<Part extends string, Value extends Comparable<Value>>(
  model: SegmentModel<Part, Value>,
  { value, defaultValue = null, onValueChange }: ValueOptions<Value>,
  form: EventTargetSource,
) {
  const [committed, request] = useControllableState(value, defaultValue, onValueChange, form);
  const [segments, setSegments] = useState(() => model.fromValue(committed));
  const [seen, setSeen] = useState(committed);
  const [buffer, setBuffer] = useState<Buffer<Part>>(null);

  if (!same(seen, committed)) {
    setSeen(committed);
    setSegments(model.fromValue(committed));
  }

  useEvent(
    "reset",
    () => {
      setSegments(model.fromValue(value === undefined ? defaultValue : value));
      setBuffer(null);
    },
    form,
  );

  const edit = (next: Segments<Part>, text: Buffer<Part>, reason: Reason, event: Event) => {
    const result = model.toValue(next);

    if (!same(result, committed)) {
      if (!request(result, reason, event)) return null;

      setSeen(result);
    }

    const shown = result === null ? next : model.fromValue(result);

    setSegments(shown);
    setBuffer(text);

    return { segments: shown, value: result };
  };

  return { committed, segments, buffer, setBuffer, edit };
}
