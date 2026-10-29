"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { ComponentProps, RefObject } from "react";

import { sharedListener } from "../events/events.ts";
import { composeRefs, mergeProps } from "../internal/slot/slot.tsx";
import { close, mark, progressOf, snapshot, subscribe } from "../toast/toast.ts";
import type { ToastRecord } from "../toast/toast.ts";
import { VisuallyHidden } from "../visually-hidden/visually-hidden.tsx";

import { Toast } from "./toaster-toast.tsx";
import { useFocusReturn } from "./use-focus-return.ts";
import styles from "./toaster.module.css";

export interface ToasterProps extends Omit<
  ComponentProps<"section">,
  "popover" | "tabIndex" | "aria-label" | "aria-keyshortcuts" | "children"
> {
  /** The name of the toasts' region, such as "Notifications", which people can jump to. */
  "aria-label": string;
  /** The name of each toast's close button, such as "Dismiss": it shows only an icon. */
  closeLabel: string;
}

const none: readonly ToastRecord[] = [];

const onVisibility = sharedListener("visibilitychange", () => document);

// `toggle` does not bubble; a capturing listener on document still sees every dialog's:
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/toggle_event
const onToggle = sharedListener("toggle", () => document, true);

let modals: readonly HTMLDialogElement[] = [];

function subscribeModals(listener: () => void) {
  if (modals.length === 0)
    modals = [...document.querySelectorAll<HTMLDialogElement>("dialog:modal")];

  return onToggle(({ target }) => {
    if (!(target instanceof HTMLDialogElement)) return;

    const rest = modals.filter((dialog) => dialog !== target);

    modals = target.matches(":modal") ? [...rest, target] : rest;
    listener();
  });
}

const useTopmostModal = () =>
  useSyncExternalStore(
    subscribeModals,
    () => modals.at(-1) ?? null,
    () => null,
  );

function useAnnounced(toasts: readonly ToastRecord[]) {
  const [heard, setHeard] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    const fresh = toasts.filter(({ id }) => progressOf(id).announced !== true).map(({ id }) => id);
    // A live region announces changes, not content it was inserted with: fill it a task later:
    // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions
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

function useTimers(
  region: RefObject<HTMLElement | null>,
  toasts: readonly ToastRecord[],
  paused: boolean,
) {
  useEffect(() => {
    const node = region.current;

    return node === null || paused ? undefined : startTimers(node, toasts);
  }, [region, toasts, paused]);
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

function observeStack(node: HTMLElement) {
  const resized = new ResizeObserver(() => {
    stack(node);
  });

  for (const item of node.querySelectorAll(`.${styles["toast"]}`)) resized.observe(item);

  stack(node);

  return () => {
    resized.disconnect();
  };
}

function useRegion(region: RefObject<HTMLElement | null>, toasts: readonly ToastRecord[]) {
  const newest = useRef<string>(undefined);

  useLayoutEffect(() => {
    const node = region.current;
    const id = toasts[0]?.id;
    const raise = id !== newest.current && node?.contains(document.activeElement) === false;

    newest.current = id;

    return node === null ? undefined : place(node, id, raise);
  }, [region, toasts]);
}

function place(node: HTMLElement, newest: string | undefined, raise: boolean) {
  // Re-showing appends the Region to the top layer again, above layers opened since:
  // https://developer.mozilla.org/en-US/docs/Glossary/Top_layer
  if (node.matches(":popover-open") && (newest === undefined || raise)) node.hidePopover();

  if (newest !== undefined && !node.matches(":popover-open")) node.showPopover();

  return observeStack(node);
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

function Layer({ closeLabel, ref, ...props }: ToasterProps) {
  const toasts = useSyncExternalStore(subscribe, snapshot, () => none);
  const region = useRef<HTMLElement>(null);
  const hidden = useSyncExternalStore(
    onVisibility,
    () => document.visibilityState === "hidden",
    () => false,
  );
  const heard = useAnnounced(toasts);
  const { restore, interacting, handlers } = useFocusReturn(region);

  useTimers(region, toasts, interacting || hidden);
  useRegion(region, toasts);

  const announced = toasts.filter(({ id }) => heard.has(id));
  const position = (at: number) => toasts.slice(0, at).filter(({ exiting }) => !exiting).length;

  return (
    <>
      <Announcer toasts={announced} assertive={false} />
      <Announcer toasts={announced} assertive />
      <section
        {...mergeProps({ className: styles["region"], ...handlers }, props)}
        ref={composeRefs(region, ref)}
        popover="manual"
        tabIndex={-1}
        aria-keyshortcuts="Alt+T"
      >
        <ol className={styles["list"]}>
          {toasts.map((record, at) => (
            <Toast
              key={record.id}
              record={record}
              index={position(at)}
              closeLabel={closeLabel}
              restore={restore}
            />
          ))}
        </ol>
      </section>
    </>
  );
}

/**
 * Shows the toasts added with `toast()` from `@platform/ui/toast`, stacked at the bottom of the
 * screen, timed and announced to screen readers. Mount exactly one, near the root inside the
 * UIProvider. Toasts stay usable while a dialog is open.
 */
export function Toaster(props: ToasterProps) {
  const modal = useTopmostModal();

  return modal === null ? <Layer {...props} /> : createPortal(<Layer {...props} />, modal);
}
