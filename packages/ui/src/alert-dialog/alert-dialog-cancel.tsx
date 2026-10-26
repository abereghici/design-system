"use client";

import { mergeProps } from "../slot/slot.tsx";

import type { ButtonProps } from "./alert-dialog-root.tsx";
import { useClose } from "./alert-dialog-root.tsx";
import button from "../button/button.module.css";

// React's autoFocus focuses at mount, while the dialog is closed; the attribute is what the dialog
// focusing steps read: https://html.spec.whatwg.org/multipage/interactive-elements.html#dialog-focusing-steps
const autofocus = (node: HTMLButtonElement | null) => {
  node?.setAttribute("autofocus", "");
};

/** The least destructive answer. It takes focus when the dialog opens. */
export function Cancel({ onClick, ...props }: ButtonProps) {
  return (
    <button
      {...mergeProps({ className: button["root"], ref: autofocus }, props)}
      {...useClose(onClick, true)}
      data-variant="secondary"
      data-size="md"
    />
  );
}
