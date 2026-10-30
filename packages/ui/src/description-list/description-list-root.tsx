import type { ComponentProps } from "react";

import "@abereghici/tokens/components/description-list.css";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./description-list.module.css";

export type RootProps = ComponentProps<"dl">;

/**
 * The details of one record, as terms and their values: compose `DescriptionList.Item` with a `Term`
 * and its `Details`. Values line up in a column while there is room and move below their term in a
 * narrow container. For rows of many records, use a Table. Works before hydration (Tier 1): it is
 * plain HTML and CSS.
 */
export function Root(props: RootProps) {
  return <dl {...mergeProps({ className: styles["root"] }, props)} />;
}
