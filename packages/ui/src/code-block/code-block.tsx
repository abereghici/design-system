import type { ComponentProps, ReactNode } from "react";

import "@abereghici/tokens/components/code-block.css";

import { mergeProps } from "../internal/slot/slot.tsx";
import { ScrollArea } from "../scroll-area/scroll-area.tsx";

import styles from "./code-block.module.css";

export interface CodeBlockProps extends ComponentProps<"pre"> {
  /** The code, as written: the block keeps its line breaks and spaces. */
  children: ReactNode;
}

/**
 * Shows code as written, with its line breaks and spaces kept. Code too wide or too tall for the
 * block scrolls, and the block is a Tab stop, as a ScrollArea is, so keyboard users can scroll it. For a key or
 * shortcut inside a sentence, use Kbd; to copy the code, add a CopyButton.
 *
 * Tier 1: works before hydration.
 */
export function CodeBlock({ children, ...props }: CodeBlockProps) {
  return (
    <ScrollArea asChild>
      <pre {...mergeProps({ className: styles["root"] }, props)}>
        <code className={styles["code"]}>{children}</code>
      </pre>
    </ScrollArea>
  );
}
