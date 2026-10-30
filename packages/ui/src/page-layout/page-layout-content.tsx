import type { ComponentProps } from "react";

import { mergeProps } from "../internal/slot/slot.tsx";
import { Stack } from "../stack/stack.tsx";

import styles from "./page-layout.module.css";

export type ContentProps = ComponentProps<"main">;

/** The page's main content, stacked in reading order. One per page, as `<main>` is. */
export function Content(props: ContentProps) {
  return (
    <Stack asChild gap="stack-lg">
      <main {...mergeProps({ className: styles["content"] }, props)} />
    </Stack>
  );
}
