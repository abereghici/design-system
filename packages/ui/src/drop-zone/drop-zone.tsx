"use client";

import { useId, useRef } from "react";
import type { ComponentProps, DragEvent } from "react";

import "@abereghici/tokens/components/drop-zone.css";

import { useField } from "../field/use-field.ts";
import { Input as FileInput, PickerContext } from "../file-trigger/file-trigger-input.tsx";
import { useFiles } from "../file-trigger/use-files.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import { useDropTarget } from "./use-drop-target.ts";
import styles from "./drop-zone.module.css";

export interface DropZoneDropEventDetails {
  readonly reason: "none";
  readonly event: DragEvent<HTMLDivElement>;
  /** Dropped files that don't match `accept`; they are not added. */
  readonly rejected: File[];
  /** Keeps the previous files in the input. */
  readonly cancel: () => void;
}

export interface DropZoneProps
  extends
    Omit<ComponentProps<"div">, "onDrop" | "onDragEnter" | "onDragOver" | "onDragLeave">,
    Pick<ComponentProps<"input">, "accept" | "multiple" | "name" | "required" | "form"> {
  /** Called after a drop with the accepted files (only the first one without `multiple`). */
  onDrop?: (files: File[], details: DropZoneDropEventDetails) => void;
  /** Refuses drops and turns off the FileTrigger inside, such as while an upload runs. */
  disabled?: boolean;
  /** Shows a button that clears the chosen files, with this name, such as "Clear files". */
  clearLabel?: string | undefined;
}

/**
 * An area that accepts files dragged from the desktop, with a FileTrigger inside as the keyboard
 * and touch alternative; drops and picks land in one native file input that submits with the form,
 * and their names show at the bottom with a Clear button.
 * Use it where uploading is the main task of a view; for a small Attach action use FileTrigger
 * alone.
 *
 * Tier 2: shows its final content before hydration and works after it; with JavaScript off, it
 * takes no drops and its FileTrigger picks files through the browser's own file input.
 */
export function DropZone({
  accept,
  multiple = false,
  name,
  required,
  form,
  disabled = false,
  onDrop,
  clearLabel,
  children,
  ...props
}: DropZoneProps) {
  const { blocked, invalid } = useField(disabled);
  const trigger = useRef<HTMLElement>(null);
  const triggerId = useId();
  const files = useFiles();
  const { target, ...handlers } = useDropTarget({
    accept,
    multiple,
    onDrop,
    blocked,
    assign: files.assign,
  });
  const picker = { input: files.inputRef, trigger, triggerId, disabled: blocked };

  return (
    <PickerContext value={picker}>
      <div
        {...mergeProps({ className: styles["root"], ...handlers }, props)}
        data-drop-target={target}
        data-invalid={invalid ? "" : undefined}
        data-disabled={blocked ? "" : undefined}
      >
        {children}
        <FileInput
          {...{ accept, multiple, name, required, form }}
          triggerRef={trigger}
          triggerId={triggerId}
          disabled={blocked}
          clearLabel={clearLabel}
          files={files}
        />
      </div>
    </PickerContext>
  );
}
