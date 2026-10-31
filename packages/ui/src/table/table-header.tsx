import type { ComponentProps } from "react";

import "@abereghici/tokens/components/table.css";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./table.module.css";

/** The row of ColumnHeaders. */
export function Header(props: ComponentProps<"thead">) {
  return <thead {...mergeProps({ className: styles["header"] }, props)} />;
}
