"use client";

import { use } from "react";
import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import { GroupContext } from "./menu-group.tsx";
import styles from "./menu.module.css";

/** Names its Group or RadioGroup. Not focusable. */
export function Label({ className, ...props }: ComponentProps<"div">) {
  const labelId = use(GroupContext);
  return <div id={labelId ?? undefined} {...props} className={join(styles["label"], className)} />;
}
