"use client";

import { useState } from "react";
import type { ComponentProps } from "react";

import { Content as PopoverContent } from "../../../components/popover/popover-content.tsx";
import { PopoverContext } from "../../../components/popover/popover-root.tsx";
import { mergeProps } from "../../utils/merge-props.ts";

import { usePanel } from "./picker.ts";
import styles from "./picker.module.css";

export type ContentProps = Omit<
  ComponentProps<"dialog">,
  "id" | "open" | "popover" | "role" | "aria-label"
>;

/** The panel holding the Calendar. Its children load on the first open, so they can be lazy. */
export function Content({ children, ...props }: ContentProps) {
  const { overlay, name } = usePanel("Content");
  const [mounted, setMounted] = useState(false);

  if (overlay.open && !mounted) setMounted(true);

  return (
    <PopoverContext value={overlay}>
      <PopoverContent {...mergeProps({ className: styles["content"] }, props)} aria-label={name}>
        {mounted && children}
      </PopoverContent>
    </PopoverContext>
  );
}
