"use client";

import { useState } from "react";
import type { MouseEvent, ReactNode } from "react";

import { Button } from "../button/button.tsx";
import type { ButtonProps } from "../button/button.tsx";
import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./copy-button.module.css";

export type CopyButtonProps = Omit<ButtonProps, "children"> & {
  /** Says what it copies, as its visible label. */
  children: ReactNode;
  /** The text it writes to the clipboard. */
  value: string;
  /** Announced and shown once the text is on the clipboard, such as "Copied". */
  copiedLabel: string;
  /** Announced and shown when the clipboard refuses the text, such as "Copying failed". */
  failedLabel: string;
};

/**
 * Copies a text, such as an ID, a token or a snippet, to the clipboard in one press, and says so in
 * a status message screen readers announce; a refused copy says that too, so a press is never
 * silent. It needs script, so it copies after hydration and is hidden while scripting is off
 * (Tier 2). For a message that goes away on its own, answer `onClick` with a Toast.
 */
export function CopyButton({
  value,
  copiedLabel,
  failedLabel,
  onClick,
  ...props
}: CopyButtonProps) {
  const [message, setMessage] = useState("");

  function handleClick(event: MouseEvent<HTMLElement>) {
    onClick?.(event);

    // Written in the handler, so the press still counts as the user activation the clipboard needs:
    // https://w3c.github.io/clipboard-apis/#dom-clipboard-writetext
    void navigator.clipboard
      .writeText(value)
      .then(
        () => copiedLabel,
        () => failedLabel,
      )
      .then((announcement) => {
        setMessage(announcement);

        return announcement;
      });
  }

  return (
    <>
      <Button
        {...mergeProps({ className: styles["button"] }, props)}
        data-copied={message === copiedLabel ? "" : undefined}
        onClick={handleClick}
      />
      {/* An <output> is a status live region, so screen readers announce the message it receives. */}
      <output className={styles["status"]}>{message}</output>
    </>
  );
}
