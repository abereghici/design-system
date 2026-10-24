import type { ComponentProps } from "react";

import { Content as ModalContent, ModalRoot } from "../dialog/modal.tsx";
import type { ContentProps as ModalContentProps, RootProps } from "../dialog/modal.tsx";

import styles from "./sheet.module.css";

export { Close } from "../dialog/close.tsx";
export type { CloseProps } from "../dialog/close.tsx";
export { Description, Title, Trigger } from "../dialog/modal.tsx";
export type { ChangeEventDetails, RootProps, TitleProps, TriggerProps } from "../dialog/modal.tsx";

const join = (own: string | undefined, className: string | undefined) =>
  className === undefined ? own : `${own} ${className}`;

/**
 * A modal side panel for a secondary task that keeps the page in view: record details, editing one
 * item, filters. Same focus and dismissal as Dialog. For a short interruptive task, use Dialog.
 */
export function Root(props: RootProps) {
  return <ModalRoot {...props} styles={styles} component="Sheet" />;
}

export interface ContentProps extends ModalContentProps {
  /** The inline edge it attaches to; `"end"` is the right edge in left-to-right text. */
  side?: "start" | "end";
}

export function Content({ side = "end", ...props }: ContentProps) {
  return <ModalContent {...props} data-side={side} />;
}

/** The scrolling region between the Title and the Footer. `tabIndex={-1}` lets a field inside take initial focus. */
export function Body({ tabIndex = 0, className, ...props }: ComponentProps<"div">) {
  return <div {...props} tabIndex={tabIndex} className={join(styles["body"], className)} />;
}

/** Lays out the buttons with the primary one at the inline end; it stays put while the Body scrolls. */
export function Footer({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={join(styles["footer"], className)} />;
}
