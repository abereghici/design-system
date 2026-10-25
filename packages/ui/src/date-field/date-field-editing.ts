import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent, RefObject } from "react";

import type { DatePart, dateFormats, Temporal } from "../date/date.ts";
import { requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";

import type { ControlOptions } from "./date-field-control.tsx";
import { fromDate, stepKey, toDate, typeDigit } from "./segments.ts";
import type { Segments } from "./segments.ts";

/** `cancel()`: keeps the previous segments. */
export type DateFieldChangeEventDetails = Details<"input-change" | "keyboard">;

type Reason = "input-change" | "keyboard";
type Buffer = { readonly part: DatePart; readonly text: string } | null;
type Formats = ReturnType<typeof dateFormats>;

type DateOptions = Pick<ControlOptions, "value" | "defaultValue" | "onValueChange" | "onFormReset">;

const same = (a: Temporal.PlainDate | null, b: Temporal.PlainDate | null) =>
  a === null || b === null ? a === b : a.equals(b);

/** The committed date and the segments being edited; an edit that changes the date is a change request. */
export function useDate({ value, defaultValue = null, onValueChange, onFormReset }: DateOptions) {
  const [own, setOwn] = useState(defaultValue);
  const committed = value === undefined ? own : value;
  const [segments, setSegments] = useState(() => fromDate(committed));
  const [seen, setSeen] = useState(committed);
  const [buffer, setBuffer] = useState<Buffer>(null);
  if (!same(seen, committed)) {
    setSeen(committed);
    setSegments(fromDate(committed));
  }
  const edit = (next: Segments, text: Buffer, reason: Reason, event: Event) => {
    const date = toDate(next);
    if (!same(date, committed)) {
      if (!requestChange(onValueChange, date, reason, event)) return null;
      setOwn(date);
      setSeen(date);
    }
    const shown = date === null ? next : fromDate(date);
    setSegments(shown);
    setBuffer(text);
    return { segments: shown, date };
  };
  const reset = () => {
    setOwn(defaultValue);
    setSegments(fromDate(defaultValue));
    setBuffer(null);
    onFormReset?.();
  };
  return { committed, segments, buffer, setBuffer, edit, reset };
}

interface Editing {
  readonly group: RefObject<HTMLElement | null>;
  readonly date: ReturnType<typeof useDate>;
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

function useGroupEvents(
  group: Editing["group"],
  focus: ReturnType<typeof useFocus>,
  onLeave: () => void,
) {
  const onPointerDown = useEffectEvent((event: PointerEvent) => {
    if (focus.isSegment(event.target)) return;
    if (event.target instanceof Element && event.target.closest("button") !== null) return;
    event.preventDefault();
    focus.firstEmpty(-1);
  });
  const onFocusOut = useEffectEvent((event: FocusEvent) => {
    const into = event.relatedTarget;
    if (!(into instanceof Node && group.current?.contains(into) === true)) onLeave();
  });
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    group.current?.addEventListener("pointerdown", onPointerDown, { signal });
    group.current?.addEventListener("focusout", onFocusOut, { signal });
    return () => {
      controller.abort();
    };
  }, [group]);
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
  if (key === "Enter") submit();
  else if (arrow) {
    const rtl = event.currentTarget.matches(":dir(rtl)");
    context.focus.move(part, (key === "ArrowRight") === rtl ? -1 : 1);
  } else if (!blocked && stepped === null) erase(context, part, key, nativeEvent);
  else if (!blocked && stepped !== null) context.change(stepped, null, "keyboard", nativeEvent);
}

/** Typing, keys and focus moves of the DateField segments. */
export function useSegmentEditing({ group, date, validity, blocked, formats, submit }: Editing) {
  const focus = useFocus(formats, date.segments);
  const edited = useRef(false);
  const committed = date.committed?.toString();
  const last = useRef(committed);
  useLayoutEffect(() => {
    if (last.current === committed) return;
    last.current = committed;
    edited.current = true;
    validity.report();
  });
  useGroupEvents(group, focus, () => {
    if (edited.current) validity.report(true);
  });
  const change = (next: Segments, text: Buffer, reason: Reason, event: Event) => {
    const result = date.edit(next, text, reason, event);
    if (result === null) return false;
    edited.current = true;
    validity.clearServerError?.();
    validity.apply(result.segments, result.date);
    validity.report();
    return true;
  };
  const typed = (part: DatePart) => (date.buffer?.part === part ? date.buffer.text : "");
  const context = { date, focus, change, typed, formats };
  return {
    register: focus.register,
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
