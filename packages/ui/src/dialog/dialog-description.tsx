"use client";

import type { ComponentProps } from "react";

import { mergeProps } from "../internal/slot/slot.tsx";

import { useModal } from "./dialog-modal.tsx";

/** Text that describes the dialog, read after its name. */
export function Description(props: ComponentProps<"p">) {
  const { id, styles } = useModal();

  return (
    <p {...mergeProps({ className: styles["description"] }, props)} id={`${id}-description`} />
  );
}
