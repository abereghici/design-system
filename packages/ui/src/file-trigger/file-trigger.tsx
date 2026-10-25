"use client";

import { createContext, use, useId, useRef, useState } from "react";
import type { ComponentProps, MouseEvent, ReactElement, RefObject } from "react";

import { requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { useEvent } from "../events/use-event.ts";
import { useField, useFieldControl } from "../field/use-field.ts";
import { Slot, composeRefs } from "../slot/slot.tsx";
import { VisuallyHidden } from "../visually-hidden/visually-hidden.tsx";

import { Selection } from "./file-trigger-selection.tsx";
import styles from "./file-trigger.module.css";

type NativeProps = Pick<
  ComponentProps<"input">,
  "accept" | "multiple" | "name" | "required" | "form"
>;

interface Picker {
  readonly input: RefObject<HTMLInputElement | null>;
  readonly trigger: RefObject<HTMLElement | null>;
  readonly disabled: boolean;
}

export const PickerContext = createContext<Picker | undefined>(undefined);

interface FileInputProps extends NativeProps {
  readonly inputRef: Picker["input"];
  readonly triggerRef: Picker["trigger"];
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

/**
 * The native file input that holds the selection for the form and joins the Field, followed by the
 * chosen file names and a Clear button.
 */
export function FileInput({
  inputRef,
  triggerRef,
  directory = false,
  clearLabel,
  ...props
}: FileInputProps) {
  const bindings = useFieldControl<HTMLInputElement, NativeProps & { disabled: boolean }>(props);
  const [names, setNames] = useState<string[]>([]);
  useEvent(
    "reset",
    () => {
      setNames([]);
    },
    () => inputRef.current?.form,
  );
  return (
    <>
      <VisuallyHidden asChild>
        <input
          {...bindings}
          {...{ webkitdirectory: directory ? "" : undefined }}
          ref={composeRefs(inputRef, bindings.ref)}
          type="file"
          tabIndex={-1}
          aria-hidden
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

/** `cancel()`: clears the selection from the file input. */
export type FileTriggerSelectEventDetails = Details<"none">;

export interface FileTriggerProps extends NativeProps {
  /** Exactly one element, usually a Button; it opens the system file picker. */
  children: ReactElement;
  /** Picks a whole folder instead of files; every file inside it is selected. */
  directory?: boolean;
  /**
   * Blocks interaction but keeps it focusable and announced, so everyone can still find it; say
   * nearby why it is unavailable.
   */
  disabled?: boolean;
  /**
   * Called after the user picks files. Choosing the same files again or closing the picker fires
   * nothing.
   */
  onSelect?: (files: File[], details: FileTriggerSelectEventDetails) => void;
  /** Shows a button that clears the chosen files, with this name, such as "Clear files". */
  clearLabel?: string | undefined;
}

function selectOnce(input: HTMLInputElement, onSelect: FileTriggerProps["onSelect"]) {
  const listening = new AbortController();
  const { signal } = listening;
  const stop = () => {
    listening.abort();
  };
  input.addEventListener("cancel", stop, { signal });
  input.addEventListener(
    "change",
    (event) => {
      stop();
      if (!requestChange(onSelect, [...(input.files ?? [])], "none", event)) input.value = "";
    },
    { signal },
  );
}

/**
 * Opens the system file picker from its one child (usually a Button), and the chosen files submit
 * with the form; their names show next to it with a Clear button. To also accept files dragged onto
 * an area, put it inside a DropZone.
 */
export function FileTrigger({
  children,
  disabled = false,
  onSelect,
  clearLabel,
  ...props
}: FileTriggerProps) {
  const zone = use(PickerContext);
  const { field, blocked, invalid } = useField(disabled || zone?.disabled);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLElement>(null);
  const inputRef = zone?.input ?? input;
  const triggerRef = zone?.trigger ?? trigger;
  const id = useId();

  function open(event: MouseEvent) {
    const target = inputRef.current;
    if (blocked || event.defaultPrevented || target === null) return;
    selectOnce(target, onSelect);
    target.click();
  }

  const button = (
    <Slot
      ref={triggerRef}
      id={field === undefined ? undefined : id}
      aria-labelledby={field === undefined ? undefined : `${field.labelId} ${id}`}
      aria-describedby={field?.describedBy}
      aria-invalid={invalid}
      {...{ disabled: blocked || undefined }}
      onClick={open}
    >
      {children}
    </Slot>
  );
  if (zone !== undefined) return button;
  return (
    <span className={styles["root"]}>
      {button}
      <FileInput
        {...props}
        inputRef={input}
        triggerRef={trigger}
        disabled={blocked}
        clearLabel={clearLabel}
      />
    </span>
  );
}
