import { useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import type { RefObject } from "react";

import "@abereghici/tokens/components/toast.css";
import "@abereghici/tokens/components/kbd.css";

import { dispatchFeedback } from "../feedback-event/feedback-event.ts";
import { composeRefs } from "../internal/compose-refs/compose-refs.ts";
import { close, mark, progressOf, remove } from "../toast/toast.ts";
import type { ToastRecord } from "../toast/toast.ts";

import { ToastContent } from "./toaster-toast-content.tsx";
import { useShortcut } from "./use-shortcut.ts";
import { useSwipe } from "./use-swipe.ts";
import styles from "./toaster.module.css";

const VISIBLE = 3;

function useExit(ref: RefObject<HTMLLIElement | null>, record: ToastRecord) {
  const { id, exiting } = record;

  useEffect(() => {
    const node = ref.current;

    if (node === null || !exiting) return;

    void Promise.allSettled(node.getAnimations().map(({ finished }) => finished)).then(() => {
      remove(id);

      return null;
    });
  }, [ref, id, exiting]);
}

const appearRef = (id: string) => (node: HTMLLIElement | null) => {
  if (node === null || progressOf(id).shown === true) return;

  mark(id, { shown: true });
  dispatchFeedback(node, "ab-appear", { component: "Toast", userInitiated: false });
};

function nextControl(node: HTMLElement | null, action: boolean) {
  let next = node?.nextElementSibling;

  while (next instanceof HTMLElement && next.dataset["exiting"] !== undefined) {
    next = next.nextElementSibling;
  }

  const control = (name: string) => next?.querySelector<HTMLElement>(`.${styles[name]}`) ?? null;

  return (action ? control("action") : null) ?? control("close");
}

interface ToastProps {
  readonly record: ToastRecord;
  readonly index: number;
  readonly closeLabel: string;
  readonly restore: () => void;
}

export function Toast({ record, index, closeLabel, restore }: ToastProps) {
  const ref = useRef<HTMLLIElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);

  useExit(ref, record);
  useShortcut(actionRef, index === 0 && !record.exiting ? record.action?.shortcut : undefined);

  const leave = (from: Element, type: "ab-dismiss" | "ab-confirm") => {
    dispatchFeedback(from, type, { component: "Toast", userInitiated: true });

    const focused = ref.current?.contains(document.activeElement) === true;
    const next = nextControl(ref.current, document.activeElement === actionRef.current);

    flushSync(() => {
      close(record.id);
    });

    if (focused && next !== null) next.focus();
    else if (focused) restore();
  };

  const swipe = useSwipe(() => {
    if (ref.current !== null) leave(ref.current, "ab-dismiss");
  });

  return (
    <li
      {...swipe}
      ref={composeRefs(ref, appearRef(record.id))}
      className={styles["toast"]}
      data-variant={record.variant ?? "neutral"}
      data-entering={progressOf(record.id).shown === true ? undefined : ""}
      data-exiting={record.exiting ? "" : undefined}
      data-front={index === 0 ? "" : undefined}
      data-hidden={index >= VISIBLE ? "" : undefined}
      inert={record.exiting || index >= VISIBLE}
    >
      <ToastContent
        record={record}
        closeLabel={closeLabel}
        actionRef={actionRef}
        onAction={(event) => {
          record.action?.onClick();
          leave(event.currentTarget, "ab-confirm");
        }}
        onDismiss={(event) => {
          leave(event.currentTarget, "ab-dismiss");
        }}
        onKeyDown={(event) => {
          if (event.key !== "Escape") return;

          event.preventDefault();
          leave(event.currentTarget, "ab-dismiss");
        }}
      />
    </li>
  );
}
