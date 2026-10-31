import { cloneElement, isValidElement } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, Ref } from "react";

import { mergeProps } from "../merge-props/merge-props.ts";

// Invoker commands are Baseline but not yet in @types/react.
declare module "react" {
  interface ButtonHTMLAttributes<T> {
    command?: string | undefined;
    commandfor?: string | undefined;
  }
}

type Props = HTMLAttributes<HTMLElement> &
  Pick<ButtonHTMLAttributes<HTMLElement>, "command" | "commandfor"> & {
    readonly ref?: Ref<HTMLElement> | undefined;
  };

/** Renders its only child with the slot's props merged in through `mergeProps`, the child as the consumer. */
export function Slot({ children, ...slot }: Props) {
  if (!isValidElement<Props>(children)) {
    throw new TypeError("asChild expects exactly one element child");
  }

  return cloneElement(children, mergeProps(slot, children.props));
}
