"use client";

import type { ComponentProps } from "react";

import { Slot, mergeProps } from "../internal/slot/slot.tsx";

import { useModal } from "./dialog-modal.tsx";

export interface TitleProps extends ComponentProps<"h2"> {
  /** Makes its one child heading the Title, so the level fits the page outline. */
  asChild?: boolean;
}

/** The heading that names the dialog. */
export function Title({ asChild = false, ...props }: TitleProps) {
  const { id, styles } = useModal();
  const Root = asChild ? Slot : "h2";

  return <Root {...mergeProps({ className: styles["title"] }, props)} id={`${id}-title`} />;
}
