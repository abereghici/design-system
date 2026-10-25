"use client";

import type { ComponentProps } from "react";

import { Slot, join } from "../slot/slot.tsx";

import { useModal, usePresence } from "./dialog-modal.tsx";

export interface TitleProps extends ComponentProps<"h2"> {
  /** Makes its one child heading the Title, so the level fits the page outline. */
  asChild?: boolean;
}

export function Title({ asChild = false, className, ...props }: TitleProps) {
  const { id, setTitle, styles } = useModal();
  usePresence(setTitle);
  const Root = asChild ? Slot : "h2";
  return <Root {...props} id={`${id}-title`} className={join(styles["title"], className)} />;
}
