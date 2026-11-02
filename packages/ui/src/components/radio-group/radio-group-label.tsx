"use client";

import type { ComponentProps } from "react";

import { mergeProps } from "../../internal/utils/merge-props.ts";
import * as Fieldset from "../fieldset/fieldset.tsx";

import styles from "./radio-group.module.css";

export type LabelProps = ComponentProps<"legend">;

/** The visible name of the group. */
export function Label(props: LabelProps) {
  return <Fieldset.Legend {...mergeProps({ className: styles["label"] }, props)} />;
}
