"use client";

import { useState, type ReactNode } from "react";

export function Dialog({ children }: Readonly<{ children: ReactNode }>) {
  const [open, setOpen] = useState(true);
  return (
    <dialog open={open} data-spike-marker="SPIKE_MARKER_DIALOG">
      <button
        type="button"
        onClick={() => {
          setOpen(false);
        }}
      >
        close
      </button>
      {children}
    </dialog>
  );
}
