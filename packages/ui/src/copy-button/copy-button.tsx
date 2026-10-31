"use client";

import { Fragment, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";

import { Button } from "../button/button.tsx";
import type { ButtonProps } from "../button/button.tsx";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./copy-button.module.css";

const STATUS_TIMEOUT = 3000;

export type CopyButtonProps = Omit<ButtonProps, "children"> & {
  /** Says what it copies, as its visible label. */
  children: ReactNode;
  /** The text it writes to the clipboard. */
  value: string;
  /**
   * Announced, and shown for three seconds, once the text is on the clipboard, such as "Copied".
   */
  copiedLabel: string;
  /**
   * Announced, and shown for three seconds, when the clipboard refuses the text, such as "Copying
   * failed".
   */
  failedLabel: string;
};

/**
 * Copies a text, such as an ID, a token or a snippet, to the clipboard in one press, and says so in
 * a status message screen readers announce, which clears three seconds later without a word; a
 * refused copy says that too, so a press is never silent.
 *
 * Tier 2: shows its final content before hydration and works after it; with JavaScript off, it is
 * hidden.
 */
export function CopyButton({
  value,
  copiedLabel,
  failedLabel,
  onClick,
  ...props
}: CopyButtonProps) {
  const [{ message, copies }, setStatus] = useState({ message: "", copies: 0 });
  const clearing = useRef<ReturnType<typeof setTimeout>>(undefined);

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
        setStatus((status) => ({ message: announcement, copies: status.copies + 1 }));
        clearTimeout(clearing.current);
        // Emptying a live region announces nothing, so the message just goes.
        clearing.current = setTimeout(() => {
          setStatus((status) => ({ ...status, message: "" }));
        }, STATUS_TIMEOUT);

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
      {/* An <output> is a status live region, so screen readers announce the message it receives;
          a new key adds the message afresh, so a second copy is announced too. */}
      <output className={styles["status"]}>
        <Fragment key={copies}>{message}</Fragment>
      </output>
    </>
  );
}
