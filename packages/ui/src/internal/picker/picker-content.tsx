"use client";

import { use, useState } from "react";
import type { ComponentProps } from "react";

import "@abereghici/tokens/components/popover.css";

import { rememberFocus } from "../overlay/overlay.ts";
import { mergeProps } from "../slot/slot.tsx";

import { PanelContext } from "./picker.ts";
import popoverStyles from "../../popover/popover.module.css";
import styles from "./picker.module.css";

export type ContentProps = Omit<
  ComponentProps<"dialog">,
  "id" | "open" | "popover" | "role" | "aria-label"
>;

/** The panel holding the Calendar. Its children load on the first open, so they can be lazy. */
export function Content({ children, ...props }: ContentProps) {
  const panel = use(PanelContext);

  if (panel === null)
    throw new Error("Content must be inside a DatePicker or DateRangePicker Root");

  const { overlay, name, trigger } = panel;
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
      {mounted && children}
    </dialog>
  );
}
