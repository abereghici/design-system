import type { ComponentProps } from "react";

import styles from "./menu.module.css";

export function Separator({ className, ...props }: ComponentProps<"hr">) {
  return (
    <hr
      {...props}
      className={
        className === undefined ? styles["separator"] : `${styles["separator"]} ${className}`
      }
    />
  );
}
