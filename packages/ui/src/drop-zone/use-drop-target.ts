import { useRef, useState } from "react";
import type { DragEvent } from "react";

import { requestChange } from "../internal/change-request/change-request.ts";
import { useEvent } from "../internal/dom-event/use-event.ts";

import { acceptMatcher } from "./accept-matcher.ts";
import type { DropZoneDropEventDetails, DropZoneProps } from "./drop-zone.tsx";

const hasFiles = (event: { dataTransfer: DataTransfer | null }) =>
  event.dataTransfer?.types.includes("Files") === true;

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
 * drop; a file dropped anywhere else on the page is refused.
 */
export function useDropTarget({ accept, multiple, onDrop, blocked, assign }: DropTargetOptions) {
  const depth = useRef(0);
  const [target, setTarget] = useState<"" | "rejected">();
  const { couldAccept, accepts } = acceptMatcher(accept);

  usePreventDocumentDrop();

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
