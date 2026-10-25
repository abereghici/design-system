"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentProps, DragEvent, RefObject } from "react";

import { requestChange } from "../events/events.ts";
import { useField } from "../field/field-control.ts";
import { FileInput, PickerContext } from "../file-trigger/file-trigger.tsx";
import { join } from "../slot/slot.tsx";

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
  /** Replaces the built-in text of the UIProvider's locale, for this instance only. */
  labels?: { clear?: string };
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

let zones = 0;
let listening = new AbortController();

// Module-wide so one pair of window listeners serves every mounted zone; without them a file dropped outside a zone replaces the page.
function usePreventDocumentDrop() {
  useEffect(() => {
    zones += 1;
    if (zones === 1) {
      listening = new AbortController();
      window.addEventListener("dragover", preventDragOver, { signal: listening.signal });
      window.addEventListener("drop", preventDrop, { signal: listening.signal });
    }
    return () => {
      zones -= 1;
      if (zones === 0) listening.abort();
    };
  }, []);
}

function setFiles(input: HTMLInputElement, files: File[]) {
  const transfer = new DataTransfer();
  for (const file of files) transfer.items.add(file);
  input.files = transfer.files;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

interface DropTargetOptions {
  readonly accept: string | undefined;
  readonly multiple: boolean;
  readonly onDrop: DropZoneProps["onDrop"];
  readonly blocked: boolean;
  readonly input: RefObject<HTMLInputElement | null>;
}

/**
 * Tracks files dragged over the zone (`dragleave` fires at every child boundary) and takes the
 * drop.
 */
function useDropTarget({ accept, multiple, onDrop, blocked, input }: DropTargetOptions) {
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
      if (blocked || input.current === null) return;
      const accepted = files.filter((file) => accepts(file)).slice(0, multiple ? undefined : 1);
      const rejected = files.filter((file) => !accepts(file));
      const report = (value: File[], details: Omit<DropZoneDropEventDetails, "rejected">) =>
        onDrop?.(value, { ...details, rejected });
      if (requestChange(report, accepted, "none", event) && accepted.length > 0) {
        setFiles(input.current, accepted);
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
 */
export function DropZone({
  accept,
  multiple = false,
  name,
  required,
  form,
  disabled = false,
  onDrop,
  labels,
  className,
  children,
  ...props
}: DropZoneProps) {
  const { blocked, invalid } = useField(disabled);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLElement>(null);
  const { target, ...handlers } = useDropTarget({ accept, multiple, onDrop, blocked, input });
  const picker = { input, trigger, disabled: blocked };
  usePreventDocumentDrop();

  return (
    <PickerContext value={picker}>
      <div
        {...props}
        className={join(styles["root"], className)}
        data-drop-target={target}
        data-invalid={invalid}
        data-disabled={blocked || undefined}
        {...handlers}
      >
        {children}
        <FileInput
          {...{ accept, multiple, name, required, form }}
          inputRef={input}
          triggerRef={trigger}
          disabled={blocked}
          labels={labels}
        />
      </div>
    </PickerContext>
  );
}
