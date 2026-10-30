"use client";

import type { ComponentProps, ReactNode } from "react";

import "@abereghici/tokens/components/code-block.css";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./code-block.module.css";

export interface CodeBlockProps extends ComponentProps<"pre"> {
  /** The code, as written: the block keeps its line breaks and spaces. */
  children: ReactNode;
}

/**
 * Shows code as written, with its line breaks and spaces kept. Code too wide or too tall for the
 * block scrolls, and only then does it take a Tab stop, so keyboard users can scroll it without
 * stopping at code that fits. It is readable before hydration, and the Tab stop arrives with it
 * (Tier 2). For a key or shortcut inside a sentence, use Kbd; to copy the code, add a CopyButton.
 */
export function CodeBlock({ children, ...props }: CodeBlockProps) {
  return (
    <pre {...mergeProps({ className: styles["root"], ref: scrollStop }, props)}>
      <code className={styles["code"]}>{children}</code>
    </pre>
  );
}

/**
 * WCAG 2.1.1 asks for keyboard access to a scroll container, but a Tab stop on code that fits would
 * only be in the way, and CSS can't answer `scrollWidth`.
 */
function scrollStop(block: HTMLPreElement) {
  const sync = () => {
    if (block.scrollWidth > block.clientWidth || block.scrollHeight > block.clientHeight) {
      block.tabIndex = 0;
    } else {
      block.removeAttribute("tabindex");
    }
  };

  const resized = new ResizeObserver(sync);
  const rewritten = new MutationObserver(sync);

  // The observers report from the next frame on, and a Tab stop is needed on the first one.
  sync();
  resized.observe(block);
  rewritten.observe(block, { childList: true, subtree: true, characterData: true });

  return () => {
    resized.disconnect();
    rewritten.disconnect();
  };
}
