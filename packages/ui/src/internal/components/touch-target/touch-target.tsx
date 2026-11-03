import styles from "./touch-target.module.css";

/**
 * Takes presses above and below a control drawn shorter than a fingertip on touch screens. Render
 * it last inside the control, which must be positioned. A container that stacks controls closer
 * than that, such as a wrapping Toolbar, sets `--ab-touch-target-gap` to the gap between its rows.
 */
export function TouchTarget() {
  return <span aria-hidden className={styles["root"]} />;
}
