"use client";

import { IconButton } from "../icon-button/icon-button.tsx";
import type { IconButtonProps } from "../icon-button/icon-button.tsx";
import { EyeOffIcon } from "../icon/icons/eye-off.tsx";
import { EyeIcon } from "../icon/icons/eye.tsx";

import styles from "./password-field.module.css";

/** The show-password toggle: an open eye while the password shows. */
export function Toggle({ pressed, ...props }: IconButtonProps & { pressed: boolean }) {
  return (
    <IconButton {...props} size="sm" className={styles["toggle"]} pressed={pressed}>
      {pressed ? <EyeIcon size="sm" /> : <EyeOffIcon size="sm" />}
    </IconButton>
  );
}
