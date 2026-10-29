"use client";

import { use, useState } from "react";
import type { ComponentProps } from "react";

import { DatePickerContext } from "../internal/date/date.ts";
import { rememberFocus } from "../internal/overlay/overlay.ts";
import { mergeProps } from "../internal/slot/slot.tsx";

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

  const { overlay, picker, name, trigger } = panel;
  const [mounted, setMounted] = useState(false);

  if (overlay.open && !mounted) setMounted(true);

  const base = `${popoverStyles["content"]} ${styles["content"]}`;

  return (
    <dialog
      {...mergeProps(
        {
          className: base,
          ...overlay.contentProps({
            onBeforeToggle: (event) => {
              if (event.newState === "open") rememberFocus(overlay.contentId, trigger.current);
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
