import { useEffect, useEffectEvent, useLayoutEffect, useRef } from "react";
import { flushSync } from "react-dom";
import type { RefObject } from "react";

import { dispatchFeedback } from "../events/events.ts";
import { close, mark, remove } from "../toast/toast.ts";
import type { ToastRecord } from "../toast/toast.ts";

import { ToastContent } from "./toast-content.tsx";
import { listenAll, useShortcut } from "./toaster-keys.ts";
import styles from "./toaster.module.css";

const VISIBLE = 3;
const SWIPE_DISTANCE = 45;
const SWIPE_SPEED = 0.11;

function tokenDuration(node: Element, danger: boolean) {
  const value = getComputedStyle(node).getPropertyValue(
    danger ? "--ab-toast-danger-duration" : "--ab-toast-duration",
  );
  const time = /(?<amount>[\d.]+)(?<unit>m?s)/v.exec(value)?.groups;
  return Number(time?.["amount"] ?? 0) * (time?.["unit"] === "s" ? 1000 : 1);
}

function useLifecycle(ref: RefObject<HTMLLIElement | null>, record: ToastRecord) {
  useLayoutEffect(() => {
    if (ref.current === null || record.remaining !== undefined) return;
    const fallback = tokenDuration(ref.current, record.variant === "danger");
    mark(record.id, { remaining: record.duration ?? fallback });
  }, [ref, record]);
  useEffect(() => {
    const node = ref.current;
    if (node === null) return;
    if (record.shown !== true) {
      mark(record.id, { shown: true });
      dispatchFeedback(node, "ab-appear", { component: "Toast", reason: "programmatic" });
    }
    if (!record.exiting) return;
    void Promise.allSettled(node.getAnimations().map(({ finished }) => finished)).then(() => {
      remove(record.id);
      return null;
    });
  }, [ref, record]);
}

function swipeOn(node: HTMLElement, onFling: () => void) {
  let start: { x: number; y: number; time: number } | undefined;
  const move = ({ clientX, clientY, timeStamp }: PointerEvent) => {
    if (start === undefined) return false;
    const x = clientX - start.x;
    const y = Math.max(0, clientY - start.y);
    node.style.setProperty("--swipe-x", `${x}px`);
    node.style.setProperty("--swipe-y", `${y}px`);
    const distance = Math.max(Math.abs(x), y);
    return (
      distance > SWIPE_DISTANCE || distance / Math.max(1, timeStamp - start.time) > SWIPE_SPEED
    );
  };
  let stop: (() => void) | undefined;
  const end = (flung: boolean) => {
    stop?.();
    start = undefined;
    delete node.dataset["swiping"];
    if (flung) onFling();
    else for (const name of ["--swipe-x", "--swipe-y"]) node.style.removeProperty(name);
  };
  const follow = () =>
    listenAll(node.ownerDocument, {
      pointermove: (event) => {
        if (event instanceof PointerEvent) move(event);
      },
      pointerup: (event) => {
        if (event instanceof PointerEvent) end(move(event));
      },
      pointercancel: () => {
        end(false);
      },
    });
  return listenAll(node, {
    pointerdown: (event) => {
      if (!(event instanceof PointerEvent) || event.button !== 0) return;
      if (event.target instanceof Element && event.target.closest("button") !== null) return;
      node.dataset["swiping"] = "";
      start = { x: event.clientX, y: event.clientY, time: event.timeStamp };
      stop = follow();
    },
  });
}

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
  useLifecycle(ref, record);
  useShortcut(actionRef, index === 0 && !record.exiting ? record.action?.shortcut : undefined);
  const leave = (from: Element, type: "ab-dismiss" | "ab-confirm") => {
    dispatchFeedback(from, type, { component: "Toast", reason: "user" });
    const focused = ref.current?.contains(document.activeElement) === true;
    const next = nextControl(ref.current, document.activeElement === actionRef.current);
    flushSync(() => {
      close(record.id);
    });
    if (focused && next !== null) next.focus();
    else if (focused) restore();
  };
  const onFling = useEffectEvent(() => {
    if (ref.current !== null) leave(ref.current, "ab-dismiss");
  });
  useEffect(() => (ref.current === null ? undefined : swipeOn(ref.current, onFling)), []);
  return (
    <li
      ref={ref}
      className={styles["toast"]}
      data-variant={record.variant ?? "neutral"}
      data-entering={record.shown === true ? undefined : ""}
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
