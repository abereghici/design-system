"use client";

import type { ComponentProps } from "react";

import { Content as ModalContent } from "../dialog/dialog-content.tsx";

export type ContentProps = Omit<ComponentProps<"dialog">, "open" | "id" | "role">;

/** The modal itself, named by its Title and described by its Description. */
export function Content(props: ContentProps) {
  return <ModalContent {...props} role="alertdialog" />;
}
