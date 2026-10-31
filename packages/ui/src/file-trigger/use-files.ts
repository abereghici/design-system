import { useRef, useState } from "react";

import { useField } from "../field/use-field.ts";
import { useEvent } from "../internal/dom-event/use-event.ts";

/**
 * The native file input's ref and its files' names, emptied when the form resets. The system picker
 * fires the input's own events; a drop or Clear puts files in with `assign`, which commits them to
 * the Field.
 */
export function useFiles() {
  const { field } = useField();
  const inputRef = useRef<HTMLInputElement>(null);
  const [names, setNames] = useState<string[]>([]);
  const show = (files: FileList | null) => {
    setNames([...(files ?? [])].map((file) => file.name));
  };

  useEvent(
    "reset",
    () => {
      setNames([]);
    },
    () => inputRef.current?.form,
  );

  return {
    inputRef,
    names,
    show,
    assign: (files: readonly File[]) => {
      const target = inputRef.current;

      if (target === null) return;

      const transfer = new DataTransfer();

      for (const file of files) transfer.items.add(file);

      target.files = transfer.files;
      show(target.files);
      field?.commit(target);
    },
  };
}
