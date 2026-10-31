import type { ComponentProps } from "react";

import { Grid } from "../grid/grid.tsx";
import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./page-layout.module.css";

export type RootProps = ComponentProps<"div">;

/**
 * The shell every screen starts from: it places `PageLayout.Header`, `Navigation`, `Content` and an
 * optional `Aside` in their landmarks, and lays them out by its own width, so the same page works in
 * a wide window and in a narrow one. Put your Navbar in the Header and your Sidebar in the
 * Navigation.
 *
 * Tier 1: works before hydration.
 */
export function Root({ children, ...props }: RootProps) {
  return (
    <div {...mergeProps({ className: styles["root"] }, props)}>
      <Grid gap="stack-lg" className={styles["grid"]}>
        {children}
      </Grid>
    </div>
  );
}
