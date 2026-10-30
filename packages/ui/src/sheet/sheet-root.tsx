import "@abereghici/tokens/components/sheet.css";

import { Modal } from "../dialog/dialog-modal.tsx";
import type { RootProps } from "../dialog/dialog-modal.tsx";

import styles from "./sheet.module.css";

/**
 * A modal side panel for a secondary task that keeps the page in view: record details, editing one
 * item, filters. Same focus and dismissal as Dialog. For a short interruptive task, use Dialog.
 */
export function Root(props: RootProps) {
  return <Modal {...props} styles={styles} component="Sheet" />;
}
