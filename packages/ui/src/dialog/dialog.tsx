import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import { ModalRoot } from "./modal.tsx";
import type { RootProps } from "./modal.tsx";
import styles from "./dialog.module.css";

export { Close } from "./close.tsx";
export type { CloseProps } from "./close.tsx";
export { Content, Description, Title, Trigger } from "./modal.tsx";
export type {
  ChangeEventDetails,
  ContentProps,
  RootProps,
  TitleProps,
  TriggerProps,
} from "./modal.tsx";

/**
 * A modal layer for a short task that interrupts the page: the page is inert until it closes, and Escape, the Close button and a press on the backdrop all close it. For an irreversible confirmation use AlertDialog; when the page must stay in view, a Sheet; for content anchored to a control, a Popover.
 */
export function Root(props: RootProps) {
  return <ModalRoot {...props} styles={styles} component="Dialog" />;
}

/** Lays out the buttons with the primary one at the inline end. */
export function Footer({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={join(styles["footer"], className)} />;
}
