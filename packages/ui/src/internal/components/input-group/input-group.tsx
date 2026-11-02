"use client";

import type { ComponentProps, ReactNode } from "react";

import { chain } from "../../utils/chain.ts";
import { mergeProps } from "../../utils/merge-props.ts";
import { InputBase } from "../input-base/input-base.tsx";

import styles from "./input-group.module.css";

/** The field's box, around an input and the content before and after it. */
export function InputGroup({
  start,
  end,
  children,
  onPointerDown,
  ...props
}: ComponentProps<"div"> & { start: ReactNode; end: ReactNode }) {
  return (
    <InputBase>
      <div
        {...mergeProps({ className: styles["group"] }, props)}
        onPointerDown={chain(onPointerDown, (event) => {
          const input = event.currentTarget.querySelector("input");

          if (!(event.target instanceof Element) || input === null || event.target === input)
            return;

          if (event.target.closest("button, a, [tabindex]") !== null) return;

          event.preventDefault();
          input.focus();
        })}
      >
        {start !== undefined && <span className={styles["start"]}>{start}</span>}
        {children}
        {end !== undefined && <span className={styles["end"]}>{end}</span>}
      </div>
    </InputBase>
  );
}
