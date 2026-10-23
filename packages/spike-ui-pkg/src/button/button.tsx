"use client";

import { useState, type ReactNode } from "react";

import { cx } from "../internal/index.ts";
import styles from "./button.module.css";

export interface ButtonProps {
  children: ReactNode;
}

export function Button({ children }: Readonly<ButtonProps>) {
  const [count, setCount] = useState(0);
  return (
    <button
      type="button"
      className={cx(styles["button"], count > 0 && "pressed")}
      data-spike-marker="SPIKE_MARKER_BUTTON"
      onClick={() => {
        setCount((c) => c + 1);
      }}
    >
      {children} {count}
    </button>
  );
}
