import type { ComponentProps } from "react";

import type { AccessibleName } from "../internal/accessible-name/accessible-name.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";
import { Stack } from "../stack/stack.tsx";

import styles from "./page-layout.module.css";

/** Name the region, so it is announced by what it holds rather than as an unnamed aside. */
export type AsideProps = Omit<ComponentProps<"aside">, "aria-label" | "aria-labelledby"> &
  AccessibleName;

/**
 * Content supporting the main content, such as filters or an activity feed: last in reading order,
 * after the content, in a narrow container. Leave it out when the page has none.
 */
export function Aside(props: AsideProps) {
  return (
    <Stack asChild>
      <aside {...mergeProps({ className: styles["aside"] }, props)} />
    </Stack>
  );
}
