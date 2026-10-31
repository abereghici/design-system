import type { ComponentProps } from "react";

import "@abereghici/tokens/components/sidebar.css";

import type { AccessibleName } from "../internal/accessible-name/accessible-name.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./sidebar.module.css";

/** Name every navigation landmark: a Sidebar usually sits beside a Navbar. */
export type RootProps = Omit<ComponentProps<"nav">, "aria-label" | "aria-labelledby"> &
  AccessibleName;

/**
 * The app's side navigation: links to its sections, optionally in labelled groups, in a column your
 * layout sizes and scrolls. Give it a name, and mark the link to the page on screen with
 * `aria-current="page"`. For a few top-level destinations, use a Navbar; for the path to this page,
 * Breadcrumbs.
 *
 * Tier 1: works before hydration.
 */
export function Root(props: RootProps) {
  return <nav {...mergeProps({ className: styles["root"] }, props)} />;
}
