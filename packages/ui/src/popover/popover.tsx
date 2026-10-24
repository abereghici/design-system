import type { ComponentProps } from "react";

import styles from "./popover.module.css";

export { Close, Content, Root, Title, Trigger } from "./popover-root.tsx";
export type {
  ChangeEventDetails,
  ChangeReason,
  CloseProps,
  ContentProps,
  RootProps,
  TitleProps,
  TriggerProps,
} from "./popover-root.tsx";

export function Description({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      {...props}
      className={
        className === undefined ? styles["description"] : `${styles["description"]} ${className}`
      }
    />
  );
}
