import { Modal } from "./dialog-modal.tsx";
import type { RootProps } from "./dialog-modal.tsx";
import styles from "./dialog.module.css";

/**
 * A modal layer for a short task that interrupts the page: the page is inert until it closes, and Escape, the Close button and a press on the backdrop all close it. For an irreversible confirmation use AlertDialog; when the page must stay in view, a Sheet; for content anchored to a control, a Popover.
 */
export function Root(props: RootProps) {
  return <Modal {...props} styles={styles} component="Dialog" />;
}
