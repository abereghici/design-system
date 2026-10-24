"use client";

import { createContext, use, useId, useRef, useState } from "react";
import type { ComponentProps, RefObject } from "react";

import { DatePickerContext, dateFormats } from "../date/date.ts";
import type { DatePickerContextValue, Temporal } from "../date/date.ts";
import { byId, isOpen, rememberFocus } from "../floating/floating.ts";
import type { Floating } from "../floating/floating.ts";
import { IconButton } from "../icon-button/icon-button.tsx";
import { CalendarIcon } from "../icon/icons/calendar.tsx";
import { useLocale } from "../provider/locale.tsx";
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
  readonly fieldBox: () => Element | null;
}

export function Trigger({ panel, value, disabled, fieldBox }: TriggerProps) {
  const { floating, name, trigger } = panel;
  const locale = useLocale();
  const wasOpen = useRef(false);
  const descriptionId = useId();
  return (
    <>
      <IconButton
        ref={trigger}
        size="sm"
        aria-label={name}
        aria-controls={floating.contentId}
        aria-expanded={floating.open}
        aria-haspopup="dialog"
        aria-describedby={value === null ? undefined : descriptionId}
        disabled={disabled}
        className={styles["trigger"]}
        onPointerDown={() => {
          wasOpen.current = isOpen(byId(floating.contentId));
        }}
        onClick={(event) => {
          // A pointer press on the trigger light-dismisses the open panel before `click`.
          const shown = event.detail > 0 ? wasOpen.current : isOpen(byId(floating.contentId));
          floating.toggle(!shown, "trigger-press", event.nativeEvent, fieldBox());
        }}
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

/** The popover holding the Calendar. Its children mount on the first open, so they can be lazy. */
export function Content({ className, children, ...props }: ContentProps) {
  const panel = use(PanelContext);
  if (panel === null) throw new Error("DatePicker.Content must be inside DatePicker.Root");
  const { floating, picker, name, trigger } = panel;
  const { onBeforeToggle, ...native } = floating.contentProps;
  const [mounted, setMounted] = useState(false);
  if (floating.open && !mounted) setMounted(true);
  const base = `${popoverStyles["content"]} ${styles["content"]}`;
  return (
    <dialog
      {...props}
      {...native}
      aria-label={name}
      className={join(base, className)}
      onBeforeToggle={(event) => {
        onBeforeToggle(event);
        if (event.newState === "open") rememberFocus(floating.contentId, trigger.current);
      }}
    >
      {mounted && <DatePickerContext value={picker}>{children}</DatePickerContext>}
    </dialog>
  );
}
