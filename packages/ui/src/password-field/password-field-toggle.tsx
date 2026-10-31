"use client";

import { EyeOffIcon } from "../icon/icons/eye-off.tsx";
import { EyeIcon } from "../icon/icons/eye.tsx";
import { ToggleButton } from "../toggle-button/toggle-button.tsx";
import type { ToggleButtonProps } from "../toggle-button/toggle-button.tsx";

import styles from "./password-field.module.css";

/** The show-password toggle: an open eye while the password shows. */
export function Toggle({
  pressed,
  ...props
}: Omit<ToggleButtonProps, "value" | "children" | "pressed" | "defaultPressed"> & {
  pressed: boolean;
}) {
  return (
    <ToggleButton {...props} value="visible" size="sm" className={styles["toggle"]} pressed={pressed}>
      {pressed ? <EyeIcon /> : <EyeOffIcon />}
    </ToggleButton>
  );
}
