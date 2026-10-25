"use client";

import { createContext, use, useId, useState } from "react";
import type { ComponentProps, RefObject } from "react";

import { DatePickerContext, dateFormats } from "../date/date.ts";
import type { DatePickerContextValue, Temporal } from "../date/date.ts";
import { rememberFocus } from "../floating/floating.ts";
import type { Floating } from "../floating/floating.ts";
import { IconButton } from "../icon-button/icon-button.tsx";
import { CalendarIcon } from "../icon/icons/calendar.tsx";
import { useLocale } from "../ui-provider/locale.tsx";
import { join } from "../slot/slot.tsx";

import popoverStyles from "../popover/popover.module.css";
import styles from "./date-picker.module.css";

export interface Panel {
  readonly floating: Floating;
  readonly picker: DatePickerContextValue;
  readonly name: string;
  readonly trigger: RefObject<HTMLButtonElement | null>;
}

export const PanelContext = createContext<Panel | null>(null);

interface TriggerProps {
  readonly panel: Omit<Panel, "picker">;
  readonly value: Temporal.PlainDate | null;
  readonly disabled: boolean;
}

export function Trigger({ panel, value, disabled }: TriggerProps) {
  const { floating, name, trigger } = panel;
  const locale = useLocale();
  const descriptionId = useId();
  return (
    <>
      <IconButton
        ref={trigger}
        size="sm"
        aria-label={name}
        {...floating.triggerProps({})}
        aria-controls={floating.contentId}
        aria-haspopup="dialog"
        aria-describedby={value === null ? undefined : descriptionId}
        disabled={disabled}
        className={styles["trigger"]}
      >
        <CalendarIcon size="sm" />
      </IconButton>
      {value !== null && (
        <span id={descriptionId} hidden>
          {dateFormats(locale.tag).full(value)}
        </span>
      )}
    </>
  );
}

export type ContentProps = Omit<
  ComponentProps<"dialog">,
  "id" | "open" | "popover" | "role" | "aria-label"
>;

/** The panel holding the Calendar. Its children load on the first open, so they can be lazy. */
export function Content({ className, children, ...props }: ContentProps) {
  const panel = use(PanelContext);
  if (panel === null) throw new Error("DatePicker.Content must be inside DatePicker.Root");
  const { floating, picker, name, trigger } = panel;
  const [mounted, setMounted] = useState(false);
  if (floating.open && !mounted) setMounted(true);
  const base = `${popoverStyles["content"]} ${styles["content"]}`;
  return (
    <dialog
      {...props}
      {...floating.contentProps({
        onBeforeToggle: (event) => {
          if (event.newState === "open") rememberFocus(floating.contentId, trigger.current);
        },
      })}
      aria-label={name}
      className={join(base, className)}
    >
      {mounted && <DatePickerContext value={picker}>{children}</DatePickerContext>}
    </dialog>
  );
}
