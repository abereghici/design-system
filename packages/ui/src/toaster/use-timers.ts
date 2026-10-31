import { useEffect, useSyncExternalStore } from "react";
import type { RefObject } from "react";

import { sharedListener } from "../internal/dom-event/shared-listener.ts";
import { close, mark, progressOf } from "../toast/toast.ts";
import type { ToastRecord } from "../toast/toast.ts";

const onVisibility = sharedListener("visibilitychange", () => document);

function tokenDuration(node: Element, danger: boolean) {
  const value = getComputedStyle(node).getPropertyValue(
    danger ? "--ab-toast-danger-duration" : "--ab-toast-duration",
  );
  const time = /(?<amount>[\d.]+)(?<unit>m?s)/v.exec(value)?.groups;

  return Number(time?.["amount"] ?? 0) * (time?.["unit"] === "s" ? 1000 : 1);
}

/** Closes each toast when its time runs out; the cleanup keeps what is left of it. */
function startTimers(node: Element, toasts: readonly ToastRecord[]) {
  const start = performance.now();
  const running = toasts
    .filter(({ exiting }) => !exiting)
    .map(({ id, duration, variant }) => ({
      id,
      remaining: progressOf(id).remaining ?? duration ?? tokenDuration(node, variant === "danger"),
    }))
    .filter(({ remaining }) => remaining < Infinity);
  const timers = running.map(({ id, remaining }) =>
    setTimeout(() => {
      close(id);
    }, remaining),
  );

  return () => {
    const elapsed = performance.now() - start;

    for (const timer of timers) clearTimeout(timer);

    for (const { id, remaining } of running) {
      mark(id, { remaining: Math.max(0, remaining - elapsed) });
    }
  };
}

/** Closes each toast when its time runs out, paused while `interacting` or the page is hidden. */
export function useTimers(
  region: RefObject<HTMLElement | null>,
  toasts: readonly ToastRecord[],
  interacting: boolean,
) {
  const hidden = useSyncExternalStore(
    onVisibility,
    () => document.visibilityState === "hidden",
    () => false,
  );
  const paused = interacting || hidden;

  useEffect(() => {
    const node = region.current;

    return node === null || paused ? undefined : startTimers(node, toasts);
  }, [region, toasts, paused]);
}
