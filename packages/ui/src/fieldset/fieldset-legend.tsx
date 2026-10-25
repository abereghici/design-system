import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./fieldset.module.css";

export function Legend({ className, ...props }: ComponentProps<"legend">) {
  return <legend {...props} className={join(styles["legend"], className)} />;
}
