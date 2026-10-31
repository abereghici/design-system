"use client";

import { useLayoutEffect, useRef } from "react";
import type { ComponentProps } from "react";

import "@abereghici/tokens/components/tabs.css";

import { composeRefs } from "../internal/compose-refs/compose-refs.ts";
import { useEvent } from "../internal/dom-event/use-event.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import { useTabs } from "./tabs-root.tsx";
import styles from "./tabs.module.css";

export interface ContentProps extends ComponentProps<"div"> {
  /** The `value` of the Trigger that shows this panel. */
  value: string;
}

/** The panel shown while its Trigger is selected; find-in-page searches it while hidden. */
export function Content({ value, ref, ...props }: ContentProps) {
  const tabs = useTabs("Content");
  const panel = useRef<HTMLDivElement>(null);
  const hidden = value !== tabs.state.value;

  // react-dom writes any truthy `hidden` as `hidden=""`, so the server sends plain hidden panels.
  useLayoutEffect(() => {
    if (hidden && panel.current !== null) panel.current.hidden = "until-found";
  }, [hidden]);

  useEvent(
    "beforematch",
    (event) => {
      const element = panel.current;

      if (element === null || event.target !== element || tabs.actions.reveal(value, event)) return;

      // The browser removes `hidden` once `beforematch` returns.
      requestAnimationFrame(() => {
        element.hidden = "until-found";
      });
    },
    () => panel.current,
  );

  return (
    <div
      tabIndex={hidden ? undefined : 0}
      {...mergeProps({ className: styles["content"] }, props)}
      ref={composeRefs(panel, ref)}
      role="tabpanel"
      id={`${tabs.meta.id}-content-${value}`}
      aria-labelledby={`${tabs.meta.id}-trigger-${value}`}
      // A panel hidden until found keeps its box, which Chrome exposes; find-in-page ignores `aria-hidden`.
      aria-hidden={hidden || undefined}
      hidden={hidden}
    />
  );
}
