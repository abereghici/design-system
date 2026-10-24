import type { ComponentProps } from "react";

import { CheckCircleIcon } from "../icon/icons/check-circle.tsx";
import { DangerIcon } from "../icon/icons/danger.tsx";
import { InfoIcon } from "../icon/icons/info.tsx";
import { WarningIcon } from "../icon/icons/warning.tsx";

import styles from "./alert.module.css";

export { Close } from "./alert-close.tsx";
export type { CloseProps } from "./alert-close.tsx";

const icons = {
  neutral: InfoIcon,
  success: CheckCircleIcon,
  warning: WarningIcon,
  danger: DangerIcon,
};

const join = (own: string | undefined, className: string | undefined) =>
  className === undefined ? own : `${own} ${className}`;

export interface RootProps extends ComponentProps<"div"> {
  /** Sets the fill and the status icon. The Title still names the situation in words. */
  variant?: "neutral" | "success" | "warning" | "danger";
  /**
   * None by default: a message rendered with the page is read in order. Pass `"alert"` only for an
   * urgent message inserted after load, which is then announced at once.
   */
  role?: ComponentProps<"div">["role"];
}

/**
 * An inline message about the page or a task that stays relevant until the situation changes. It
 * has no role by default; pass `role="alert"` only for an urgent message inserted after load.
 * `Alert.Close` calls your `onClick`, where the app removes the Alert and moves focus to what the
 * message was about. For brief confirmation use a Toast; for a decision that must interrupt, an
 * AlertDialog.
 */
export function Root({ variant = "neutral", className, children, ...props }: RootProps) {
  const Icon = icons[variant];
  return (
    <div {...props} data-variant={variant} className={join(styles["root"], className)}>
      <Icon size="sm" className={styles["icon"]} />
      {children}
    </div>
  );
}

export function Title({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={join(styles["title"], className)} />;
}

export function Description({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={join(styles["description"], className)} />;
}
