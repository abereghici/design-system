"use client";

import { useId } from "react";

import { dateFormats } from "../date/date.ts";
import type { Temporal } from "../date/date.ts";
import { IconButton } from "../icon-button/icon-button.tsx";
import { CalendarIcon } from "../icon/icons/calendar.tsx";

import type { Panel } from "./date-picker-panel.tsx";
import styles from "./date-picker.module.css";

interface TriggerProps {
  readonly panel: Omit<Panel, "picker">;
  readonly value: Temporal.PlainDate | null;
  readonly locale: Intl.LocalesArgument;
  readonly disabled: boolean;
}

export function Trigger({ panel, value, locale, disabled }: TriggerProps) {
  const { floating, name, trigger } = panel;
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
          {dateFormats(locale).full(value)}
        </span>
      )}
    </>
  );
}
