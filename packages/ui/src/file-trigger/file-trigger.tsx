"use client";

import { createContext, use, useEffect, useId, useRef } from "react";
import type { ComponentProps, MouseEvent, ReactElement, RefObject } from "react";

import type { ChangeEventDetails as Details } from "../events/events.ts";
import { FieldContext, useFieldControl } from "../field/field-control.ts";
import { Slot } from "../slot/slot.tsx";
import { VisuallyHidden } from "../visually-hidden/visually-hidden.tsx";

import styles from "./file-trigger.module.css";

type NativeProps = Pick<
  ComponentProps<"input">,
  "accept" | "multiple" | "name" | "required" | "form"
>;

export interface Picker {
  readonly input: RefObject<HTMLInputElement | null>;
  readonly trigger: RefObject<HTMLElement | null>;
  readonly disabled: boolean;
}

export const PickerContext = createContext<Picker | undefined>(undefined);

interface FileInputProps extends NativeProps {
  readonly inputRef: Picker["input"];
  readonly triggerRef: Picker["trigger"];
  readonly disabled: boolean;
}

/** The native file input that holds the selection for the form and joins the Field. */
export function FileInput({ inputRef, triggerRef, ...props }: FileInputProps) {
  const bindings = useFieldControl<HTMLInputElement, NativeProps & { disabled: boolean }>(props);
  return (
    <VisuallyHidden asChild>
      <input
        {...bindings}
        ref={inputRef}
        type="file"
        tabIndex={-1}
        aria-hidden
        // The input is focusable only so a blocked submit can focus it; focus moves on to the visible trigger.
        onFocus={() => triggerRef.current?.focus()}
        onChange={undefined}
        onClick={(event) => {
          if (bindings["aria-disabled"] === true) event.preventDefault();
        }}
      />
    </VisuallyHidden>
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
      onSelect?.([...(input.files ?? [])], {
        reason: "none",
        event,
        cancel: () => {
          input.value = "";
        },
      });
    },
    { signal },
  );
}

/**
 * Opens the system file picker from its one child (usually a Button), and the chosen files submit
 * with the form. It draws nothing itself: show the chosen files from `onSelect`. To also accept files
 * dragged onto an area, put it inside a DropZone.
 */
export function FileTrigger({
  children,
  directory = false,
  disabled = false,
  onSelect,
  ...props
}: FileTriggerProps) {
  const zone = use(PickerContext);
  const field = use(FieldContext);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLElement>(null);
  const blocked = disabled || zone?.disabled === true || field?.disabled === true;
  const inputRef = zone?.input ?? input;
  const triggerRef = zone?.trigger ?? trigger;
  useEffect(() => {
    if (input.current) input.current.webkitdirectory = directory;
  }, [directory]);
  const id = useId();

  function open(event: MouseEvent) {
    const target = inputRef.current;
    if (blocked || event.defaultPrevented || target === null) return;
    selectOnce(target, onSelect);
    target.click();
  }

  return (
    <>
      <Slot
        ref={triggerRef}
        className={styles["trigger"]}
        id={field === undefined ? undefined : id}
        aria-labelledby={field === undefined ? undefined : `${field.labelId} ${id}`}
        aria-describedby={field?.describedBy}
        aria-invalid={field?.invalid === true || undefined}
        {...{ disabled: blocked || undefined }}
        onClick={open}
      >
        {children}
      </Slot>
      {zone === undefined && (
        <FileInput {...props} inputRef={input} triggerRef={trigger} disabled={blocked} />
      )}
    </>
  );
}
