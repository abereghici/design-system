import { useEffectEvent, useLayoutEffect, useRef } from "react";
import type { ChangeEvent, FocusEvent, KeyboardEvent, PointerEvent, RefObject } from "react";

import { isComposing, trackComposition } from "../events/events.ts";
import type { DatePart, Temporal, useDateFormats } from "../internal/date/date.ts";
import { mergeProps } from "../internal/slot/slot.tsx";

import { stepKey, typeDigit } from "./segments.ts";
import type { Segments } from "./segments.ts";
import type { Buffer, Reason, useDateValue } from "./use-date-value.ts";

type Formats = ReturnType<typeof useDateFormats>;

interface Editing {
  readonly date: ReturnType<typeof useDateValue>;
  readonly validity: {
    readonly apply: (segments: Segments, date: Temporal.PlainDate | null) => void;
    readonly report: (commit?: boolean) => void;
    readonly clearServerError: (() => void) | undefined;
  };
  readonly blocked: boolean;
  readonly formats: Formats;
  readonly submit: () => void;
}

const SEPARATORS = new Set(["/", ".", "-"]);

function useFocus(formats: Formats, segments: Segments) {
  const elements = useRef(new Map<DatePart, HTMLElement>());
  const order = formats.layout.flatMap((item) => ("part" in item ? [item.part] : []));
  const focus = (part: DatePart | undefined) => {
    if (part !== undefined) elements.current.get(part)?.focus();
  };

  return {
    register: (part: DatePart) => (node: HTMLElement | null) => {
      if (node === null) elements.current.delete(part);
      else elements.current.set(part, node);
    },
    move: (part: DatePart, delta: number) => {
      focus(order[order.indexOf(part) + delta]);
    },
    firstEmpty: (fallback: number) => {
      focus(order.find((part) => segments[part] === undefined) ?? order.at(fallback));
    },
    isSegment: (target: EventTarget | null) =>
      order.some((part) => elements.current.get(part) === target),
  };
}

interface Context {
  readonly date: Editing["date"];
  readonly focus: ReturnType<typeof useFocus>;
  readonly change: (next: Segments, text: Buffer, reason: Reason, event: Event) => boolean;
  readonly typed: (part: DatePart) => string;
  readonly formats: Formats;
}

function typeChar(
  { date, focus, change, typed, formats }: Context,
  part: DatePart,
  char: string,
  event: Event,
) {
  if (/\d/v.test(char)) {
    const next = typeDigit(part, date.segments, typed(part), char);
    const buffer = next.done ? null : { part, text: next.buffer };

    if (change(next.segments, buffer, "input-change", event) && next.done) focus.move(part, 1);

    return;
  }

  const literal =
    SEPARATORS.has(char) ||
    formats.layout.some((item) => "literal" in item && item.literal.trim() === char);

  if (!literal) return;

  date.setBuffer(null);
  focus.move(part, 1);
}

function erase({ date, focus, change, typed }: Context, part: DatePart, key: string, event: Event) {
  const value = date.segments[part];
  const text = typed(part) || (value === undefined ? "" : String(value));
  const rest = key === "Delete" ? "" : text.slice(0, -1);

  if (text === "" && key === "Backspace") {
    focus.move(part, -1);

    return;
  }

  const segments = { ...date.segments, [part]: Number(rest) || undefined };

  change(segments, rest === "" ? null : { part, text: rest }, "input-change", event);
}

function pressKey(
  context: Context,
  part: DatePart,
  event: KeyboardEvent<HTMLInputElement>,
  blocked: boolean,
  submit: () => void,
) {
  const { key, nativeEvent } = event;

  if (event.altKey || event.ctrlKey || event.metaKey) return;

  const arrow = key === "ArrowLeft" || key === "ArrowRight";
  const stepped = stepKey(part, context.date.segments, key);
  const erasing = key === "Backspace" || key === "Delete";

  if (!arrow && !erasing && stepped === null && key !== "Enter") return;

  event.preventDefault();

  if (key === "Enter") {
    if (!isComposing(event)) submit();
  } else if (arrow) {
    const rtl = event.currentTarget.matches(":dir(rtl)");

    context.focus.move(part, (key === "ArrowRight") === rtl ? -1 : 1);
  } else if (!blocked && stepped === null) erase(context, part, key, nativeEvent);
  else if (!blocked && stepped !== null) context.change(stepped, null, "keyboard", nativeEvent);
}

/** Whether the user or the app changed the date; a committed change reports validity at once. */
function useEdited(committed: string | undefined, validity: Editing["validity"]) {
  const edited = useRef(false);
  const last = useRef(committed);
  const report = useEffectEvent(() => {
    validity.report();
  });

  useLayoutEffect(() => {
    if (last.current === committed) return;

    last.current = committed;
    edited.current = true;
    report();
  }, [committed]);

  return {
    edited,
    markEdited: () => {
      edited.current = true;
    },
  };
}

/** The group's props: a press between segments focuses the first empty one; leaving reports validity. */
function useGroupProps(
  focus: ReturnType<typeof useFocus>,
  edited: RefObject<boolean>,
  validity: Editing["validity"],
) {
  return <Props extends object>(className: string, consumer: Props) =>
    mergeProps(
      {
        className,
        onPointerDown: (event: PointerEvent<HTMLElement>) => {
          if (focus.isSegment(event.target)) return;

          if (event.target instanceof Element && event.target.closest("button") !== null) return;

          event.preventDefault();
          focus.firstEmpty(-1);
        },
        onBlur: (event: FocusEvent<HTMLElement>) => {
          const into = event.relatedTarget;

          if (into instanceof Node && event.currentTarget.contains(into)) return;

          if (edited.current) validity.report(true);
        },
      },
      consumer,
    );
}

/** Typing, keys and focus moves of the DateField segments. */
export function useSegmentEditing({ date, validity, blocked, formats, submit }: Editing) {
  const focus = useFocus(formats, date.segments);
  const { edited, markEdited } = useEdited(date.committed?.toString(), validity);
  const change = (next: Segments, text: Buffer, reason: Reason, event: Event) => {
    const result = date.edit(next, text, reason, event);

    if (result === null) return false;

    markEdited();
    validity.clearServerError?.();
    validity.apply(result.segments, result.date);
    validity.report();

    return true;
  };

  const typed = (part: DatePart) => (date.buffer?.part === part ? date.buffer.text : "");
  const context = { date, focus, change, typed, formats };

  return {
    groupProps: useGroupProps(focus, edited, validity),
    register: focus.register,
    onCompositionEnd: trackComposition(),
    focusFirstEmpty: () => {
      focus.firstEmpty(0);
    },
    onChange: (part: DatePart, { nativeEvent }: ChangeEvent<HTMLInputElement>) => {
      if (blocked || !(nativeEvent instanceof InputEvent) || nativeEvent.isComposing) return;

      const char = nativeEvent.data ?? "";

      if (char.length === 1) typeChar(context, part, char, nativeEvent);
    },
    onKeyDown: (part: DatePart, event: KeyboardEvent<HTMLInputElement>) => {
      pressKey(context, part, event, blocked, submit);
    },
  };
}
