"use client";

import type { ComponentProps } from "react";

import { mergeProps, presenceRef } from "../slot/slot.tsx";

import { useModal } from "./dialog-modal.tsx";

export function Description(props: ComponentProps<"p">) {
  const { id, setDescription, styles } = useModal();
  return (
    <p
      {...mergeProps({ className: styles["description"], ref: presenceRef(setDescription) }, props)}
      id={`${id}-description`}
    />
  );
}
