import type { ComponentProps } from "react";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./page-layout.module.css";

export type RootProps = ComponentProps<"div">;

/**
 * The shell every screen starts from: it places `PageLayout.Header`, `Navigation`, `Content` and an
 * optional `Aside` in their landmarks, and lays them out by its own width, so the same page works in
 * a wide window and in a narrow one. Put your Navbar in the Header and your Sidebar in the
 * Navigation. Works before hydration (Tier 1): it is plain HTML and CSS.
 */
export function Root({ children, ...props }: RootProps) {
  return (
    <div {...mergeProps({ className: styles["root"] }, props)}>
      <div className={styles["grid"]}>{children}</div>
    </div>
  );
}
