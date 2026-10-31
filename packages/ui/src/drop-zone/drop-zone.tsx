"use client";

import { useId, useRef, useState } from "react";
import type { ComponentProps, DragEvent } from "react";

import "@abereghici/tokens/components/drop-zone.css";

import { useField } from "../field/use-field.ts";
import { Input as FileInput, PickerContext } from "../file-trigger/file-trigger-input.tsx";
import { useFiles } from "../file-trigger/use-files.ts";
import { requestChange } from "../internal/change-request/change-request.ts";
import { useEvent } from "../internal/dom-event/use-event.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

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

const hasFiles = (event: { dataTransfer: DataTransfer | null }) =>
  event.dataTransfer?.types.includes("Files") === true;

const typeMatches = (token: string, type: string) =>
  token.endsWith("/*") ? type.startsWith(token.slice(0, -1)) : type === token;

/** During a drag only MIME types are known, so an extension token can't reject anything yet. */
function matcher(accept: string | undefined) {
  const tokens = accept?.split(",").flatMap((token) => token.trim().toLowerCase() || []) ?? [];

  return {
    couldAccept: (items: DataTransferItemList) =>
      tokens.length === 0 ||
      [...items].some(
        ({ type }) =>
          type === "" || tokens.some((token) => token.startsWith(".") || typeMatches(token, type)),
      ),
    accepts: (file: File) =>
      tokens.length === 0 ||
      tokens.some((token) =>
        token.startsWith(".")
          ? file.name.toLowerCase().endsWith(token)
          : typeMatches(token, file.type.toLowerCase()),
      ),
  };
}

const preventDragOver = (event: globalThis.DragEvent) => {
  if (!hasFiles(event) || event.defaultPrevented || event.dataTransfer === null) return;

  event.preventDefault();
  event.dataTransfer.dropEffect = "none";
};

const preventDrop = (event: globalThis.DragEvent) => {
  if (hasFiles(event)) event.preventDefault();
};

const getWindow = () => window;

// Without these, a file dropped outside a zone replaces the page:
// https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
function usePreventDocumentDrop() {
  useEvent("dragover", preventDragOver, getWindow);
  useEvent("drop", preventDrop, getWindow);
}

interface DropTargetOptions {
  readonly accept: string | undefined;
  readonly multiple: boolean;
  readonly onDrop: DropZoneProps["onDrop"];
  readonly blocked: boolean;
  readonly assign: (files: readonly File[]) => void;
}

/**
 * Tracks files dragged over the zone (`dragleave` fires at every child boundary) and takes the
 * drop.
 */
function useDropTarget({ accept, multiple, onDrop, blocked, assign }: DropTargetOptions) {
  const depth = useRef(0);
  const [target, setTarget] = useState<"" | "rejected">();
  const { couldAccept, accepts } = matcher(accept);

  return {
    target,
    onDragEnter: (event: DragEvent<HTMLDivElement>) => {
      if (!hasFiles(event) || blocked) return;

      depth.current += 1;
      setTarget(couldAccept(event.dataTransfer.items) ? "" : "rejected");
    },
    onDragOver: (event: DragEvent<HTMLDivElement>) => {
      if (!hasFiles(event)) return;

      event.preventDefault();
      event.dataTransfer.dropEffect = blocked || target === "rejected" ? "none" : "copy";
    },
    onDragLeave: (event: DragEvent<HTMLDivElement>) => {
      if (!hasFiles(event) || blocked) return;

      depth.current -= 1;

      if (depth.current === 0) setTarget(undefined);
    },
    onDrop: (event: DragEvent<HTMLDivElement>) => {
      if (!hasFiles(event)) return;

      event.preventDefault();
      depth.current = 0;
      setTarget(undefined);

      const files = [...event.dataTransfer.files];

      if (blocked) return;

      const accepted = files.filter((file) => accepts(file)).slice(0, multiple ? undefined : 1);
      const rejected = files.filter((file) => !accepts(file));
      const report = (value: File[], details: Omit<DropZoneDropEventDetails, "rejected">) =>
        onDrop?.(value, { ...details, rejected });

      if (requestChange(report, accepted, "none", event) && accepted.length > 0) {
        assign(accepted);
      }
    },
  };
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

  usePreventDocumentDrop();

  return (
    <PickerContext value={picker}>
      <div
        {...mergeProps({ className: styles["root"] }, props)}
        data-drop-target={target}
        data-invalid={invalid ? "" : undefined}
        data-disabled={blocked ? "" : undefined}
        {...handlers}
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
