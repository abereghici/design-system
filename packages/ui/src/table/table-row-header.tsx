"use client";

import { use } from "react";
import type { ComponentProps } from "react";

import "@abereghici/tokens/components/table.css";

import { mergeProps } from "../internal/slot/slot.tsx";

import { RowContext } from "./table-row.tsx";
import styles from "./table.module.css";

/** The cell that names its row, such as an ID; it also names the row's `SelectRow` control. */
export function RowHeader(props: ComponentProps<"th">) {
  const row = use(RowContext);

  return (
    <th scope="row" {...mergeProps({ className: styles["cell"], id: row?.headerId }, props)} />
  );
}
