"use client";

import { PressFeedbackContext } from "../../internal/interactions/use-press-button.ts";
import { mergeProps } from "../../internal/utils/merge-props.ts";
import { Button } from "../button/button.tsx";

import type { ButtonProps } from "./alert-dialog-root.tsx";
import { useClose } from "./alert-dialog-root.tsx";

// React's autoFocus focuses at mount, while the dialog is closed; the attribute is what the dialog
// focusing steps read: https://html.spec.whatwg.org/multipage/interactive-elements.html#dialog-focusing-steps
const autofocus = (node: HTMLButtonElement | null) => {
  node?.setAttribute("autofocus", "");
};

/** The least destructive answer. It takes focus when the dialog opens. */
export function Cancel({ onClick, ...props }: ButtonProps) {
  return (
    <PressFeedbackContext value={false}>
      <Button {...mergeProps({ ref: autofocus }, props)} {...useClose(onClick, true)} />
    </PressFeedbackContext>
  );
}
