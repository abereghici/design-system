"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { ComponentProps, RefObject } from "react";

import { useLocale } from "../provider/locale.tsx";
import { toaster as toasterLabels } from "../provider/locales/en-US/toaster.ts";
import { composeRefs, join } from "../slot/slot.tsx";
import { close, mark, snapshot, subscribe } from "../toast/toast.ts";
import type { ToastRecord } from "../toast/toast.ts";
import { VisuallyHidden } from "../visually-hidden/visually-hidden.tsx";

import { Toast } from "./toast-item.tsx";
import { useFocusReturn } from "./toaster-keys.ts";
import styles from "./toaster.module.css";

export interface ToasterProps extends Omit<
  ComponentProps<"section">,
  "popover" | "tabIndex" | "aria-label" | "aria-keyshortcuts" | "children"
> {
  /** The Region's name and every toast's Dismiss name; fall back to the Provider's locale. */
  labels?: { region?: string; close?: string };
}

const none: readonly ToastRecord[] = [];

const onVisibility = (listener: () => void) => {
  const controller = new AbortController();
  document.addEventListener("visibilitychange", listener, { signal: controller.signal });
  return () => {
    controller.abort();
  };
};

const openModals = () =>
  typeof document === "undefined"
    ? []
    : [...document.querySelectorAll<HTMLDialogElement>("dialog:modal")];

function useTopmostModal() {
  const [modals, setModals] = useState<readonly HTMLDialogElement[]>(openModals);
  useEffect(() => {
    const controller = new AbortController();
    const onToggle = ({ target }: Event) => {
      if (!(target instanceof HTMLDialogElement)) return;
      setModals((list) => {
        const rest = list.filter((dialog) => dialog !== target);
        return target.matches(":modal") ? [...rest, target] : rest;
      });
    };
    // `toggle` does not bubble; a capturing listener on document still sees every dialog's.
    document.addEventListener("toggle", onToggle, { capture: true, signal: controller.signal });
    return () => {
      controller.abort();
    };
  }, []);
  return modals.at(-1);
}

function useAnnounced(toasts: readonly ToastRecord[]) {
  const [heard, setHeard] = useState<ReadonlySet<string>>(new Set());
  useEffect(() => {
    const fresh = toasts.filter((record) => record.announced !== true).map(({ id }) => id);
    // A live region announces changes, not content it was inserted with: fill it a task later.
    const timer = setTimeout(() => {
      for (const id of fresh) mark(id, { announced: true });
      if (fresh.length > 0) setHeard((ids) => ids.union(new Set(fresh)));
    });
    return () => {
      clearTimeout(timer);
    };
  }, [toasts]);
  return heard;
}

function useTimers(toasts: readonly ToastRecord[], paused: boolean) {
  useEffect(() => {
    const start = performance.now();
    const running = paused
      ? []
      : toasts.filter(({ exiting, remaining }) => !exiting && (remaining ?? Infinity) < Infinity);
    const timers = running.map(({ id, remaining }) =>
      setTimeout(() => {
        close(id);
      }, remaining),
    );
    return () => {
      const elapsed = performance.now() - start;
      for (const timer of timers) clearTimeout(timer);
      for (const { id, remaining = 0 } of running) {
        mark(id, { remaining: Math.max(0, remaining - elapsed) });
      }
    };
  }, [toasts, paused]);
}

function stack(node: HTMLElement) {
  let index = 0;
  let offset = 0;
  for (const item of node.querySelectorAll<HTMLElement>(`.${styles["toast"]}`)) {
    if (item.dataset["exiting"] !== undefined) continue;
    item.style.setProperty("--index", String(index));
    item.style.setProperty("--offset", `${offset}px`);
    index += 1;
    offset += item.offsetHeight;
  }
}

function useRegion(region: RefObject<HTMLElement | null>, toasts: readonly ToastRecord[]) {
  const newest = useRef<string>(undefined);
  const resized = useRef<ResizeObserver>(undefined);
  useLayoutEffect(() => {
    const node = region.current;
    if (node === null) return;
    const id = toasts[0]?.id;
    // Re-showing appends the Region to the top layer again, above layers opened since.
    const raise = id !== newest.current && !node.contains(document.activeElement);
    if (node.matches(":popover-open") && (id === undefined || raise)) node.hidePopover();
    if (id !== undefined && !node.matches(":popover-open")) node.showPopover();
    newest.current = id;
    resized.current ??= new ResizeObserver(() => {
      stack(node);
    });
    for (const item of node.querySelectorAll(`.${styles["toast"]}`)) resized.current.observe(item);
    stack(node);
  });
  useEffect(
    () => () => {
      resized.current?.disconnect();
    },
    [],
  );
}

function Announcer({ toasts, assertive }: { toasts: readonly ToastRecord[]; assertive: boolean }) {
  return (
    <VisuallyHidden asChild>
      <div role={assertive ? "alert" : "status"} aria-atomic="false">
        {toasts
          .filter(({ variant }) => (variant === "danger") === assertive)
          .map(({ id, title, description }) => (
            <p key={id}>{description === undefined ? title : `${title} ${description}`}</p>
          ))}
      </div>
    </VisuallyHidden>
  );
}

function Layer({ labels, className, ref, ...props }: ToasterProps) {
  const toasts = useSyncExternalStore(subscribe, snapshot, () => none);
  const locale = useLocale().labels;
  const region = useRef<HTMLElement>(null);
  const hidden = useSyncExternalStore(
    onVisibility,
    () => document.visibilityState === "hidden",
    () => false,
  );
  const heard = useAnnounced(toasts);
  const { restore, interacting } = useFocusReturn(region);
  useTimers(toasts, interacting || hidden);
  useRegion(region, toasts);
  const announced = toasts.filter(({ id }) => heard.has(id));
  const position = (at: number) => toasts.slice(0, at).filter(({ exiting }) => !exiting).length;
  return (
    <>
      <Announcer toasts={announced} assertive={false} />
      <Announcer toasts={announced} assertive />
      <section
        {...props}
        ref={composeRefs(region, ref)}
        popover="manual"
        tabIndex={-1}
        aria-label={labels?.region ?? locale.toaster?.region ?? toasterLabels.region}
        aria-keyshortcuts="Alt+T"
        className={join(styles["region"], className)}
      >
        <ol className={styles["list"]}>
          {toasts.map((record, at) => (
            <Toast
              key={record.id}
              record={record}
              index={position(at)}
              closeLabel={labels?.close ?? locale.toaster?.close ?? toasterLabels.close}
              restore={restore}
            />
          ))}
        </ol>
      </section>
    </>
  );
}

/**
 * Shows the toasts added with `toast()` from `@platform/ui/toast`: a "Notifications" landmark at
 * the bottom centre that stacks, times and announces them. Mount exactly one, near the root inside
 * the Provider. While a modal dialog is open it renders inside it, so its toasts stay pressable and
 * announced.
 */
export function Toaster(props: ToasterProps) {
  const modal = useTopmostModal();
  return modal === undefined ? <Layer {...props} /> : createPortal(<Layer {...props} />, modal);
}
