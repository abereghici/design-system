"use client";

import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import { useModal, usePresence } from "./dialog-modal.tsx";

/** Text that describes the dialog, read after its name. */
export function Description(props: ComponentProps<"p">) {
  const { id, setDescription, styles } = useModal();
  usePresence(setDescription);
  return (
    <p {...mergeProps({ className: styles["description"] }, props)} id={`${id}-description`} />
  );
}
