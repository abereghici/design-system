import type { ComponentProps } from "react";

import "@abereghici/tokens/components/empty-state.css";

import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./empty-state.module.css";

/**
 * Stands in for content that isn't there yet (an empty list, a search with no results). The Title
 * says what is missing, the Description why or what to do, and the actions after it offer the next
 * step. Screen readers don't announce it when it appears: announce a filter's empty result from your
 * own `role="status"` region. For a load still running, use Skeleton or Spinner; for an error, an
 * Alert.
 *
 * Tier 1: works before hydration.
 */
export function Root(props: ComponentProps<"div">) {
  return <div {...mergeProps({ className: styles["root"] }, props)} />;
}
