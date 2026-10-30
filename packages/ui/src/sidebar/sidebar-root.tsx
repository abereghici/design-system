import type { ComponentProps } from "react";

import "@abereghici/tokens/components/sidebar.css";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./sidebar.module.css";

type AccessibleName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string };

/** Name every navigation landmark: a Sidebar usually sits beside a Navbar. */
export type RootProps = Omit<ComponentProps<"nav">, "aria-label" | "aria-labelledby"> &
  AccessibleName;

/**
 * The app's side navigation: links to its sections, optionally in labelled groups, in a column your
 * layout sizes and scrolls. Give it a name, and mark the link to the page on screen with
 * `aria-current="page"`. For a few top-level destinations, use a Navbar; for the path to this page,
 * Breadcrumbs.
 */
export function Root(props: RootProps) {
  return <nav {...mergeProps({ className: styles["root"] }, props)} />;
}
