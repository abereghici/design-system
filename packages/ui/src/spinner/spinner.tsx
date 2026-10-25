import type { ComponentProps, ReactNode } from "react";

import { join } from "../slot/slot.tsx";

import visuallyHidden from "../visually-hidden/visually-hidden.module.css";
import styles from "./spinner.module.css";

type Message =
  | {
      /** What is working, such as "Loading", read by screen readers and not shown. */
      children: ReactNode;
      "aria-hidden"?: false | undefined;
    }
  | {
      /** Hides it from assistive technology, inside a control that already says it is busy. */
      "aria-hidden": true;
      children?: undefined;
    };

export type SpinnerProps = Omit<ComponentProps<"span">, "children" | "aria-hidden"> &
  Message & {
    /** `sm` beside text or inside a control, `lg` for a region. */
    size?: "sm" | "lg";
  };

/**
 * Shows that something is working, for a wait of unknown length. Give it its message ("Loading").
 * Show it only once a wait passes about 400 ms, so quick answers don't flash, and set `aria-busy`
 * on the region it stands in. For measurable progress use Progress; for content of known shape,
 * Skeleton; inside a busy Button, its `loading`.
 */
export function Spinner({ size = "sm", className, children, ...props }: SpinnerProps) {
  return (
    <span
      role={props["aria-hidden"] === true ? undefined : "status"}
      {...props}
      data-size={size}
      className={join(styles["root"], className)}
    >
      {children !== undefined && <span className={visuallyHidden["root"]}>{children}</span>}
    </span>
  );
}
