import type { KeyboardEvent, MouseEvent, RefObject } from "react";

import { CheckCircleIcon } from "../icon/icons/check-circle.tsx";
import { DangerIcon } from "../icon/icons/danger.tsx";
import { InfoIcon } from "../icon/icons/info.tsx";
import { WarningIcon } from "../icon/icons/warning.tsx";
import { XIcon } from "../icon/icons/x.tsx";
import { Kbd } from "../kbd/kbd.tsx";
import type { ToastRecord } from "../toast/toast.ts";

import { keyNames } from "./toaster-keys.ts";
import styles from "./toaster.module.css";

const icons = {
  neutral: InfoIcon,
  success: CheckCircleIcon,
  warning: WarningIcon,
  danger: DangerIcon,
};

interface ContentProps {
  readonly record: ToastRecord;
  readonly closeLabel: string;
  readonly actionRef: RefObject<HTMLButtonElement | null>;
  readonly onAction: (event: MouseEvent<HTMLButtonElement>) => void;
  readonly onDismiss: (event: MouseEvent<HTMLButtonElement>) => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

export function ToastContent({
  record,
  closeLabel,
  actionRef,
  onAction,
  onDismiss,
  onKeyDown,
}: ContentProps) {
  const Icon = icons[record.variant ?? "neutral"];
  const shortcut = record.action?.shortcut;
  return (
    <>
      <Icon size="sm" className={styles["icon"]} />
      <div className={styles["title"]}>{record.title}</div>
      {record.description !== undefined && (
        <div className={styles["description"]}>{record.description}</div>
      )}
      <div className={styles["actions"]}>
        {record.action !== undefined && (
          <button
            ref={actionRef}
            type="button"
            className={styles["action"]}
            aria-keyshortcuts={shortcut === undefined ? undefined : keyNames(shortcut).join("+")}
            onKeyDown={onKeyDown}
            onClick={onAction}
          >
            {record.action.label}
            {shortcut !== undefined && (
              <Kbd keys={shortcut} aria-hidden className={styles["kbd"]} />
            )}
          </button>
        )}
        <button
          type="button"
          className={styles["close"]}
          aria-label={closeLabel}
          onKeyDown={onKeyDown}
          onClick={onDismiss}
        >
          <XIcon size="sm" />
        </button>
      </div>
    </>
  );
}
