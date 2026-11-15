import type { ComponentProps } from "react";

import { mergeProps } from "../../internal/utils/merge-props.ts";

import styles from "./action-list.module.css";

export type RootProps = ComponentProps<"ul">;

/**
 * A list of links, one per row, such as profiles elsewhere or related pages. Compose an
 * `ActionList.LinkItem` per row, named by its text, with an optional `Description`,
 * `LeadingVisual` and `TrailingVisual`. Tab moves from row to row and Enter follows the link.
 * For links inside running text use Link; for a site's sections, Sidebar or Navbar.
 *
 * Tier 1: works before hydration.
 */
export function Root(props: RootProps) {
  return <ul {...mergeProps({ className: styles["root"] }, props)} />;
}
