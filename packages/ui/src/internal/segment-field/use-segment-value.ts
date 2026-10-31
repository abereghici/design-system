import { useState } from "react";

import { requestChange } from "../../events/events.ts";
import type { ChangeEventDetails as Details } from "../../events/events.ts";

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
  readonly onFormReset?: (() => void) | undefined;
}

/** The committed value and the segments being edited; an edit that changes the value is a change request. */
export function useSegmentValue<Part extends string, Value extends Comparable<Value>>(
  model: SegmentModel<Part, Value>,
  { value, defaultValue = null, onValueChange, onFormReset }: ValueOptions<Value>,
) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const committed = value === undefined ? uncontrolled : value;
  const [segments, setSegments] = useState(() => model.fromValue(committed));
  const [seen, setSeen] = useState(committed);
  const [buffer, setBuffer] = useState<Buffer<Part>>(null);

  if (!same(seen, committed)) {
    setSeen(committed);
    setSegments(model.fromValue(committed));
  }

  const edit = (next: Segments<Part>, text: Buffer<Part>, reason: Reason, event: Event) => {
    const result = model.toValue(next);

    if (!same(result, committed)) {
      if (!requestChange(onValueChange, result, reason, event)) return null;

      setUncontrolled(result);
      setSeen(result);
    }

    const shown = result === null ? next : model.fromValue(result);

    setSegments(shown);
    setBuffer(text);

    return { segments: shown, value: result };
  };

  const reset = () => {
    setUncontrolled(defaultValue);
    setSegments(model.fromValue(defaultValue));
    setBuffer(null);
    onFormReset?.();
  };

  return { committed, segments, buffer, setBuffer, edit, reset };
}
