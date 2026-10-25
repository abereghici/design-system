"use client";

import { use, useEffect } from "react";
import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import { FieldContext } from "./use-field.ts";
import styles from "./field.module.css";

export function Description({ className, ...props }: ComponentProps<"p">) {
  const field = use(FieldContext);
  const describe = field?.describe;
  useEffect(() => {
    describe?.(true);
    return () => {
      describe?.(false);
    };
  }, [describe]);
  return (
    <p
      id={field?.descriptionId}
      hidden={field?.invalid}
      {...props}
      className={join(styles["description"], className)}
    />
  );
}
