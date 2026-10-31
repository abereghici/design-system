"use client";

import { createContext, useState, useSyncExternalStore } from "react";
import type { ComponentProps, RefObject } from "react";

import { useEvent } from "../events/use-event.ts";
import { useField, useFieldControl } from "../field/use-field.ts";
import { composeRefs } from "../internal/slot/slot.tsx";
import { VisuallyHidden } from "../visually-hidden/visually-hidden.tsx";

import { Selection } from "./file-trigger-selection.tsx";
import styles from "./file-trigger.module.css";

export type NativeProps = Pick<
  ComponentProps<"input">,
  "accept" | "multiple" | "name" | "required" | "form"
>;

interface Picker {
  readonly input: RefObject<HTMLInputElement | null>;
  readonly trigger: RefObject<HTMLElement | null>;
  readonly triggerId: string;
  readonly disabled: boolean;
}

export const PickerContext = createContext<Picker | undefined>(undefined);

interface InputProps extends NativeProps {
  readonly inputRef: Picker["input"];
  readonly triggerRef: Picker["trigger"];
  readonly triggerId: string;
  readonly disabled: boolean;
  readonly directory?: boolean;
  readonly clearLabel: string | undefined;
}

function clear(input: HTMLInputElement | null, trigger: HTMLElement | null) {
  if (input === null) return;

  input.value = "";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  trigger?.focus();
}

const subscribeToNothing = () => () => {};

/**
 * Whether React has hydrated. The server HTML keeps the input in the tab order and the
 * accessibility tree for when script never runs; once hydrated, the trigger takes over both.
 */
function useHydrated() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

/** The chosen file names, emptied when the form resets. */
function useNames(inputRef: Picker["input"]) {
  const [names, setNames] = useState<string[]>([]);

  useEvent(
    "reset",
    () => {
      setNames([]);
    },
    () => inputRef.current?.form,
  );

  return [names, setNames] as const;
}

/**
 * The native file input that holds the selection for the form and joins the Field, followed by the
 * chosen file names and a Clear button. Without script it stands in for the trigger, named by it.
 */
export function Input({
  inputRef,
  triggerRef,
  triggerId,
  directory = false,
  clearLabel,
  ...props
}: InputProps) {
  const { field } = useField();
  const bindings = useFieldControl<HTMLInputElement, NativeProps & { disabled: boolean }>(props);
  const [names, setNames] = useNames(inputRef);
  const hydrated = useHydrated();

  return (
    <>
      <VisuallyHidden asChild>
        <input
          {...bindings}
          {...{ webkitdirectory: directory ? "" : undefined }}
          ref={composeRefs(inputRef, bindings.ref)}
          className={styles["input"]}
          type="file"
          tabIndex={hydrated ? -1 : undefined}
          aria-hidden={hydrated || undefined}
          aria-labelledby={field === undefined ? triggerId : `${field.labelId} ${triggerId}`}
          // The input is focusable only so a blocked submit can focus it; focus moves on to the visible trigger.
          onFocus={() => triggerRef.current?.focus()}
          onChange={undefined}
          onInput={(event) => {
            setNames([...(event.currentTarget.files ?? [])].map((file) => file.name));
          }}
          onClick={(event) => {
            if (bindings["aria-disabled"] === true) event.preventDefault();
          }}
        />
      </VisuallyHidden>
      <Selection
        names={names}
        clearLabel={clearLabel}
        disabled={props.disabled}
        onClear={() => {
          clear(inputRef.current, triggerRef.current);
        }}
      />
    </>
  );
}
