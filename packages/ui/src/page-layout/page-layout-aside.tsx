import type { ComponentProps } from "react";

import { mergeProps } from "../internal/slot/slot.tsx";
import { Stack } from "../stack/stack.tsx";

import styles from "./page-layout.module.css";

type AccessibleName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string };

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
