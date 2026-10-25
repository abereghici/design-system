"use client";

import type { ComponentProps } from "react";

import { Slot, mergeProps } from "../slot/slot.tsx";

import { useModal, usePresence } from "./dialog-modal.tsx";

export interface TitleProps extends ComponentProps<"h2"> {
  /** Makes its one child heading the Title, so the level fits the page outline. */
  asChild?: boolean;
}

/** The heading that names the dialog. */
export function Title({ asChild = false, ...props }: TitleProps) {
  const { id, setTitle, styles } = useModal();
  usePresence(setTitle);
  const Root = asChild ? Slot : "h2";
  return <Root {...mergeProps({ className: styles["title"] }, props)} id={`${id}-title`} />;
}
