import type { ComponentProps } from "react";

import { mergeProps } from "../internal/slot/slot.tsx";
import { Stack } from "../stack/stack.tsx";

import styles from "./page-layout.module.css";

export type NavigationProps = ComponentProps<"div">;

/** The column beside the content, for your Sidebar: above the content in a narrow container. */
export function Navigation(props: NavigationProps) {
  return (
    <Stack asChild>
      <div {...mergeProps({ className: styles["navigation"] }, props)} />
    </Stack>
  );
}
