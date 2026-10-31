"use client";

import { use, useId, useRef } from "react";
import type { MouseEvent, ReactElement } from "react";

import { useField } from "../field/use-field.ts";
import { requestChange } from "../internal/change-request/change-request.ts";
import type { ChangeEventDetails as Details } from "../internal/change-request/change-request.ts";
import { Slot } from "../internal/slot/slot.tsx";

import { Input, PickerContext } from "./file-trigger-input.tsx";
import type { NativeProps } from "./file-trigger-input.tsx";
import { useFiles } from "./use-files.ts";
import styles from "./file-trigger.module.css";

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
 * an area, put it inside a DropZone. With JavaScript off, the browser's own file input takes the
 * trigger's place.
 *
 * Tier 1: works before hydration.
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
  const files = useFiles();
  const trigger = useRef<HTMLElement>(null);
  const inputRef = zone?.input ?? files.inputRef;
  const triggerRef = zone?.trigger ?? trigger;
  const ownId = useId();
  const id = zone?.triggerId ?? ownId;

  function open(event: MouseEvent) {
    const target = inputRef.current;

    if (blocked || event.defaultPrevented || target === null) return;

    selectOnce(target, onSelect);
    target.click();
  }

  const button = (
    <Slot
      ref={triggerRef}
      id={id}
      className={styles["trigger"]}
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
      <Input
        {...props}
        triggerRef={trigger}
        triggerId={id}
        disabled={blocked}
        clearLabel={clearLabel}
        files={files}
      />
    </span>
  );
}
