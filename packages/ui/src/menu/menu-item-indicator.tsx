"use client";

import { CheckIcon } from "../icon/icons/check.tsx";

import styles from "./menu.module.css";

export function Indicator({ checked, radio }: { checked: boolean; radio: boolean }) {
  return (
    <span aria-hidden className={styles["indicator"]}>
      {checked && (radio ? <span className={styles["diamond"]} /> : <CheckIcon size="sm" />)}
    </span>
  );
}
