"use client";

import { useId } from "react";

import { IconButton } from "../icon-button/icon-button.tsx";
import { CalendarIcon } from "../icon/icons/calendar.tsx";

import type { Panel } from "./date-picker-panel.tsx";
import styles from "./date-picker.module.css";

interface TriggerProps {
  readonly panel: Panel;
  /** The chosen date or range, in full words. */
  readonly description: string | undefined;
  readonly disabled: boolean;
  /** The `form` of the field's inputs: the picker's value resets with that form. */
  readonly form: string | undefined;
}

export function Trigger({ panel, description, disabled, form }: TriggerProps) {
  const { overlay, name, trigger } = panel;
  const descriptionId = useId();

  return (
    <>
      <IconButton
        ref={trigger}
        size="sm"
        aria-label={name}
        {...overlay.triggerProps({})}
        aria-controls={overlay.contentId}
        aria-haspopup="dialog"
        aria-describedby={description === undefined ? undefined : descriptionId}
        disabled={disabled}
        form={form}
        className={styles["trigger"]}
      >
        <CalendarIcon size="sm" />
      </IconButton>
      {description !== undefined && (
        <span id={descriptionId} hidden>
          {description}
        </span>
      )}
    </>
  );
}
