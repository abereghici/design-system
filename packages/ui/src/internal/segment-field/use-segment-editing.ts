import { useEffectEvent, useLayoutEffect, useRef } from "react";
import type { ChangeEvent, FocusEvent, KeyboardEvent, PointerEvent, RefObject } from "react";

import { isComposing, trackComposition } from "../../events/events.ts";
import { mergeProps } from "../slot/slot.tsx";

import { erasePart, stepKey, typeDigit, typeLetter } from "./segments.ts";
import type { Comparable, SegmentModel, Segments } from "./segments.ts";
import type { Buffer, Reason, useSegmentValue } from "./use-segment-value.ts";
import fieldStyles from "../../field/field.module.css";

interface Validity<Part extends string, Value> {
  readonly apply: (segments: Segments<Part>, value: Value | null) => void;
  readonly report: (commit?: boolean) => void;
  readonly clearServerError: (() => void) | undefined;
}

interface Editing<Part extends string, Value extends Comparable<Value>> {
  readonly model: SegmentModel<Part, Value>;
  readonly state: ReturnType<typeof useSegmentValue<Part, Value>>;
  readonly validity: Validity<Part, Value>;
  readonly blocked: boolean;
  readonly submit: () => void;
}

const SEPARATORS = new Set(["/", ".", "-"]);

function useFocus<Part extends string, Value>(
  model: SegmentModel<Part, Value>,
  segments: Segments<Part>,
) {
  const elements = useRef(new Map<Part, HTMLElement>());
  const order = model.layout.flatMap((item) => ("part" in item ? [item.part] : []));
  const focus = (part: Part | undefined) => {
    if (part !== undefined) elements.current.get(part)?.focus();
  };

  return {
    register: (part: Part) => (node: HTMLElement | null) => {
      if (node === null) elements.current.delete(part);
      else elements.current.set(part, node);
    },
    move: (part: Part, delta: number) => {
      const segment = elements.current.get(part);
      // In the field box's order, so a DateRangePicker's end date follows its start date.
      const box = segment?.closest(`.${CSS.escape(fieldStyles["control"] ?? "")}`);
      const all = [...(box?.querySelectorAll<HTMLElement>('[role="spinbutton"]') ?? [])];

      if (segment !== undefined) all[all.indexOf(segment) + delta]?.focus();
    },
    firstEmpty: (fallback: number) => {
      focus(order.find((part) => segments[part] === undefined) ?? order.at(fallback));
    },
    isSegment: (target: EventTarget | null) =>
      order.some((part) => elements.current.get(part) === target),
  };
}

interface Context<Part extends string, Value extends Comparable<Value>> {
  readonly model: SegmentModel<Part, Value>;
  readonly state: Editing<Part, Value>["state"];
  readonly focus: ReturnType<typeof useFocus<Part, unknown>>;
  readonly change: (
    next: Segments<Part>,
    text: Buffer<Part>,
    reason: Reason,
    event: Event,
  ) => boolean;
  readonly typed: (part: Part) => string;
}

function typeChar<Part extends string, Value extends Comparable<Value>>(
  { model, state, focus, change, typed }: Context<Part, Value>,
  part: Part,
  char: string,
  event: Event,
) {
  if (model.digits(part) === 0) {
    const lettered = typeLetter(model, part, state.segments, char);

    if (lettered !== null) {
      if (change(lettered, null, "input-change", event)) focus.move(part, 1);

      return;
    }
  } else if (/\d/v.test(char)) {
    const next = typeDigit(model, part, state.segments, typed(part), char);
    const buffer = next.done ? null : { part, text: next.buffer };

    if (change(next.segments, buffer, "input-change", event) && next.done) focus.move(part, 1);

    return;
  }

  const literal =
    SEPARATORS.has(char) ||
    model.layout.some((item) => "literal" in item && item.literal.trim() === char);

  if (!literal) return;

  state.setBuffer(null);
  focus.move(part, 1);
}

function erase<Part extends string, Value extends Comparable<Value>>(
  { model, state, focus, change, typed }: Context<Part, Value>,
  part: Part,
  key: string,
  event: Event,
) {
  const value = state.segments[part];
  const text = typed(part) || (value === undefined ? "" : String(value));
  const rest = key === "Delete" ? "" : text.slice(0, -1);

  if (text === "" && key === "Backspace") {
    focus.move(part, -1);

    return;
  }

  const segments = erasePart(model, part, state.segments, rest);

  change(segments, rest === "" ? null : { part, text: rest }, "input-change", event);
}

function pressKey<Part extends string, Value extends Comparable<Value>>(
  context: Context<Part, Value>,
  part: Part,
  event: KeyboardEvent<HTMLInputElement>,
  blocked: boolean,
  submit: () => void,
) {
  const { key, nativeEvent } = event;

  if (event.altKey || event.ctrlKey || event.metaKey) return;

  const arrow = key === "ArrowLeft" || key === "ArrowRight";
  const stepped = stepKey(context.model, part, context.state.segments, key);
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

/** Whether the user or the app changed the value; a committed change reports validity at once. */
function useEdited(committed: string | undefined, report: () => void) {
  const edited = useRef(false);
  const last = useRef(committed);
  const onChange = useEffectEvent(report);

  useLayoutEffect(() => {
    if (last.current === committed) return;

    last.current = committed;
    edited.current = true;
    onChange();
  }, [committed]);

  return {
    edited,
    markEdited: () => {
      edited.current = true;
    },
  };
}

/** The group's props: a press between segments focuses the first empty one; leaving reports validity. */
function useGroupProps<Part extends string>(
  focus: ReturnType<typeof useFocus<Part, unknown>>,
  edited: RefObject<boolean>,
  report: (commit?: boolean) => void,
) {
  return <Props extends object>(className: string | undefined, consumer: Props) =>
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

          if (edited.current) report(true);
        },
      },
      consumer,
    );
}

/** Typing, keys and focus moves of a value's segments. */
export function useSegmentEditing<Part extends string, Value extends Comparable<Value>>({
  model,
  state,
  validity,
  blocked,
  submit,
}: Editing<Part, Value>) {
  const focus = useFocus(model, state.segments);
  const committed = state.committed === null ? undefined : model.serialize(state.committed);
  const { edited, markEdited } = useEdited(committed, () => {
    validity.report();
  });
  const change = (next: Segments<Part>, text: Buffer<Part>, reason: Reason, event: Event) => {
    const result = state.edit(next, text, reason, event);

    if (result === null) return false;

    markEdited();
    validity.clearServerError?.();
    validity.apply(result.segments, result.value);
    validity.report();

    return true;
  };

  const typed = (part: Part) => (state.buffer?.part === part ? state.buffer.text : "");
  const context = { model, state, focus, change, typed };

  return {
    groupProps: useGroupProps(focus, edited, validity.report),
    register: focus.register,
    onCompositionEnd: trackComposition(),
    focusFirstEmpty: () => {
      focus.firstEmpty(0);
    },
    onChange: (part: Part, { nativeEvent }: ChangeEvent<HTMLInputElement>) => {
      if (blocked || !(nativeEvent instanceof InputEvent) || nativeEvent.isComposing) return;

      const char = nativeEvent.data ?? "";

      if (char.length === 1) typeChar(context, part, char, nativeEvent);
    },
    onKeyDown: (part: Part, event: KeyboardEvent<HTMLInputElement>) => {
      pressKey(context, part, event, blocked, submit);
    },
  };
}
