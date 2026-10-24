"use client";

import { useId, useRef } from "react";
import type { RefObject } from "react";

import { dateFormats } from "../date/date.ts";
import type { Temporal } from "../date/date.ts";
import { byId, isOpen } from "../floating/floating.ts";
import type { Floating } from "../floating/floating.ts";
import { IconButton } from "../icon-button/icon-button.tsx";
import { CalendarIcon } from "../icon/icons/calendar.tsx";
import { useLocale } from "../provider/locale.tsx";

import styles from "./date-picker.module.css";

interface TriggerProps {
  readonly panel: {
    readonly floating: Floating;
    readonly name: string;
    readonly trigger: RefObject<HTMLButtonElement | null>;
  };
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
