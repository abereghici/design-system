import type { ComponentProps } from "react";

import { Inline } from "../inline/inline.tsx";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./page-layout.module.css";

export type HeaderProps = ComponentProps<"header">;

/** The page's banner, across the top: your Logo, your Navbar and the actions beside them. */
export function Header(props: HeaderProps) {
  return (
    <Inline asChild gap="inline-md" justify="space-between">
      <header {...mergeProps({ className: styles["header"] }, props)} />
    </Inline>
  );
}
