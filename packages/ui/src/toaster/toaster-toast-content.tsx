import type { KeyboardEvent, MouseEvent, RefObject } from "react";

import "@abereghici/tokens/components/toast.css";
import "@abereghici/tokens/components/kbd.css";

import { XIcon } from "../icon/icons/x.tsx";
import { variantIcons } from "../internal/variant-icons/variant-icons.ts";
import { Kbd } from "../kbd/kbd.tsx";
import type { ToastRecord } from "../toast/toast.ts";

import { keyNames } from "./use-shortcut.ts";
import styles from "./toaster.module.css";

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
  const Icon = variantIcons[record.variant ?? "neutral"];
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
