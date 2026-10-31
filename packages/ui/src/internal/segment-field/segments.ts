export type Segments<Part extends string> = Readonly<Partial<Record<Part, number>>>;

/** A value typed in segments, as DateField's date and TimeField's time. */
export interface SegmentModel<Part extends string, Value> {
  /** The parts and the separator texts between them, in the Locale's order. */
  readonly layout: readonly ({ readonly part: Part } | { readonly literal: string })[];
  /** The Locale's name of a part, such as "month". */
  readonly name: (part: Part) => string;
  readonly bounds: (
    part: Part,
    segments: Segments<Part>,
  ) => { readonly min: number; readonly max: number };
  /** How many digits a part takes; 0 for a part typed by its first letter, such as AM and PM. */
  readonly digits: (part: Part) => number;
  /** A part's text, such as "09", "2026" or "PM". */
  readonly text: (part: Part, value: number) => string;
  /** A part's value as said aloud when its number means nothing alone, such as "October". */
  readonly spoken: (part: Part, value: number) => string | undefined;
  /** The complete value, or `null` while a part is empty. */
  readonly toValue: (segments: Segments<Part>) => Value | null;
  readonly fromValue: (value: Value | null) => Segments<Part>;
  /** The value now, where an empty part starts stepping from. */
  readonly now: () => Value;
  /** The type of the native input that holds the value for the form. */
  readonly input: "date" | "time";
  /** The value in the native input's format, such as "2026-10-24" or "14:30". */
  readonly serialize: (value: Value) => string;
}

export interface Comparable<Value> {
  equals(other: Value): boolean;
}

export const same = <Value extends Comparable<Value>>(a: Value | null, b: Value | null) =>
  a === null || b === null ? a === b : a.equals(b);

const set = <Part extends string>(
  segments: Segments<Part>,
  part: Part,
  value: number | undefined,
) => ({ ...segments, [part]: value }) as Segments<Part>;

/** Adds a typed digit; `done` means the segment can take no more digits and focus moves on. */
export function typeDigit<Part extends string, Value>(
  model: SegmentModel<Part, Value>,
  part: Part,
  segments: Segments<Part>,
  buffer: string,
  digit: string,
) {
  const { min, max } = model.bounds(part, segments);
  const joined = buffer + digit;
  const text = Number(joined) > max ? digit : joined;
  const value = Number(text);
  const done = text.length === model.digits(part) || value * 10 > max;

  return {
    segments: set(segments, part, value < min ? undefined : value),
    buffer: done ? "" : text,
    done,
  };
}

/** The value of a part typed by its first letter, such as "p" for PM. */
export function typeLetter<Part extends string, Value>(
  model: SegmentModel<Part, Value>,
  part: Part,
  segments: Segments<Part>,
  letter: string,
) {
  const { min, max } = model.bounds(part, segments);
  const typed = letter.toLocaleLowerCase();
  const value = Array.from({ length: max - min + 1 }, (_, index) => min + index).find((option) =>
    model.text(part, option).toLocaleLowerCase().startsWith(typed),
  );

  return value === undefined ? null : set(segments, part, value);
}

/** The segments with a part erased to `rest`, the digits a Backspace leaves. */
export function erasePart<Part extends string, Value>(
  model: SegmentModel<Part, Value>,
  part: Part,
  segments: Segments<Part>,
  rest: string,
) {
  const value = Number(rest);

  return set(
    segments,
    part,
    rest === "" || value < model.bounds(part, segments).min ? undefined : value,
  );
}

/** Arrow keys, Home and End; an empty segment starts from the current value's part. */
export function stepKey<Part extends string, Value>(
  model: SegmentModel<Part, Value>,
  part: Part,
  segments: Segments<Part>,
  key: string,
) {
  const { min, max } = model.bounds(part, segments);
  const current = segments[part];
  const step = (delta: number) =>
    current === undefined
      ? (model.fromValue(model.now())[part] ?? min)
      : ((current - min + delta + (max - min + 1)) % (max - min + 1)) + min;
  const next = new Map([
    ["ArrowUp", () => step(1)],
    ["ArrowDown", () => step(-1)],
    ["Home", () => min],
    ["End", () => max],
  ]).get(key);

  return next === undefined ? null : set(segments, part, next());
}

export function display<Part extends string, Value>(
  model: SegmentModel<Part, Value>,
  part: Part,
  segments: Segments<Part>,
  buffer: string,
) {
  if (buffer !== "") return buffer;

  const value = segments[part];

  return value === undefined ? null : model.text(part, value);
}
