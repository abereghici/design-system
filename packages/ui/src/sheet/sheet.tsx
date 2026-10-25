import type { ComponentProps } from "react";

import { Content as ModalContent, ModalRoot } from "../dialog/modal.tsx";
import type { ContentProps as ModalContentProps, RootProps } from "../dialog/modal.tsx";
import { join } from "../slot/slot.tsx";

import styles from "./sheet.module.css";

export { Close } from "../dialog/close.tsx";
export type { CloseProps } from "../dialog/close.tsx";
export { Description, Title, Trigger } from "../dialog/modal.tsx";
export type { ChangeEventDetails, RootProps, TitleProps, TriggerProps } from "../dialog/modal.tsx";

/**
 * A modal side panel for a secondary task that keeps the page in view: record details, editing one
 * item, filters. Same focus and dismissal as Dialog. For a short interruptive task, use Dialog.
 */
export function Root(props: RootProps) {
  return <ModalRoot {...props} styles={styles} component="Sheet" />;
}

export interface ContentProps extends ModalContentProps {
  /** The edge it slides from, following the reading direction: `"end"` is the right in English. */
  side?: "start" | "end";
}

export function Content({ side = "end", ...props }: ContentProps) {
  return <ModalContent {...props} data-side={side} />;
}

/**
 * The scrolling content between the Title and the Footer. Pass `tabIndex={-1}` to let a field
 * inside take focus first.
 */
export function Body({ tabIndex = 0, className, ...props }: ComponentProps<"div">) {
  return <div {...props} tabIndex={tabIndex} className={join(styles["body"], className)} />;
}

/** Holds the buttons, the primary one last; it stays in view while the Body scrolls. */
export function Footer({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={join(styles["footer"], className)} />;
}
