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
 * block scrolls, and the block is a Tab stop, so keyboard users can scroll it. For a key or
 * shortcut inside a sentence, use Kbd; to copy the code, add a CopyButton.
 *
 * Tier 1: works before hydration.
 */
export function CodeBlock({ children, ...props }: CodeBlockProps) {
  // Keyboard users scroll the block from a Tab stop (WCAG 2.1.1). Only script can tell whether the
  // code overflows, and not every engine makes a scroll container focusable on its own, so the block
  // always takes one.
  return (
    <pre {...mergeProps({ className: styles["root"], tabIndex: 0 }, props)}>
      <code className={styles["code"]}>{children}</code>
    </pre>
  );
}
