"use client";

import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import { useModal, usePresence } from "./dialog-modal.tsx";

export function Description({ className, ...props }: ComponentProps<"p">) {
  const { id, setDescription, styles } = useModal();
  usePresence(setDescription);
  return (
    <p {...props} id={`${id}-description`} className={join(styles["description"], className)} />
  );
}
