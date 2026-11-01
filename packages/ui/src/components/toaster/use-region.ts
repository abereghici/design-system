import { useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";

import type { ToastRecord } from "../toast/toast.ts";

import styles from "./toaster.module.css";

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

/** Shows the region above the top layer for a new toast and stacks the toasts in it. */
export function useRegion(region: RefObject<HTMLElement | null>, toasts: readonly ToastRecord[]) {
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
