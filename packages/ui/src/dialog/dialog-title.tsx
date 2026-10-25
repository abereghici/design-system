"use client";

import type { ComponentProps } from "react";

import { Slot, mergeProps, presenceRef } from "../slot/slot.tsx";

import { useModal } from "./dialog-modal.tsx";

export interface TitleProps extends ComponentProps<"h2"> {
  /** Makes its one child heading the Title, so the level fits the page outline. */
  asChild?: boolean;
}

/** The heading that names the dialog. */
export function Title({ asChild = false, ...props }: TitleProps) {
  const { id, setTitle, styles } = useModal();
  const Root = asChild ? Slot : "h2";

  return (
    <Root
      {...mergeProps({ className: styles["title"], ref: presenceRef(setTitle) }, props)}
      id={`${id}-title`}
    />
  );
}
