"use client";

import { use, useState } from "react";
import type { ComponentProps } from "react";

import { DatePickerContext } from "../date/date.ts";
import { rememberFocus } from "../floating/floating.ts";
import { mergeProps } from "../slot/slot.tsx";

import { PanelContext } from "./date-picker-panel.tsx";
import popoverStyles from "../popover/popover.module.css";
import styles from "./date-picker.module.css";

export type ContentProps = Omit<
  ComponentProps<"dialog">,
  "id" | "open" | "popover" | "role" | "aria-label"
>;

/** The panel holding the Calendar. Its children load on the first open, so they can be lazy. */
export function Content({ children, ...props }: ContentProps) {
  const panel = use(PanelContext);
  if (panel === null) throw new Error("DatePicker.Content must be inside DatePicker.Root");
  const { floating, picker, name, trigger } = panel;
  const [mounted, setMounted] = useState(false);
  if (floating.open && !mounted) setMounted(true);
  const base = `${popoverStyles["content"]} ${styles["content"]}`;
  return (
    <dialog
      {...mergeProps(
        {
          className: base,
          ...floating.contentProps({
            onBeforeToggle: (event) => {
              if (event.newState === "open") rememberFocus(floating.contentId, trigger.current);
            },
          }),
        },
        props,
      )}
      aria-label={name}
    >
      {mounted && <DatePickerContext value={picker}>{children}</DatePickerContext>}
    </dialog>
  );
}
