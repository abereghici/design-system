"use client";

import { composeRefs, join } from "../slot/slot.tsx";

import type { ButtonProps } from "./alert-dialog-root.tsx";
import { useClose } from "./alert-dialog-root.tsx";
import button from "../button/button.module.css";

// React's autoFocus focuses at mount, while the dialog is closed; the attribute is what the dialog focusing steps read.
const autofocus = (node: HTMLButtonElement | null) => {
  node?.setAttribute("autofocus", "");
};

/** The least destructive answer. It takes focus when the dialog opens. */
export function Cancel({ className, onClick, ref, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      {...useClose(onClick, true)}
      ref={composeRefs(ref, autofocus)}
      data-variant="secondary"
      data-size="md"
      className={join(button["root"], className)}
    />
  );
}
