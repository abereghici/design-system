import { cloneElement, isValidElement } from "react";
import type { HTMLAttributes, Ref } from "react";

import type { InvokerCommands } from "../invoker-commands/invoker-commands.ts";
import { mergeProps } from "../merge-props/merge-props.ts";

type Props = HTMLAttributes<HTMLElement> &
  InvokerCommands & {
    readonly ref?: Ref<HTMLElement> | undefined;
  };

/** Renders its only child with the slot's props merged in through `mergeProps`, the child as the consumer. */
export function Slot({ children, ...slot }: Props) {
  if (!isValidElement<Props>(children)) {
    throw new TypeError("asChild expects exactly one element child");
  }

  return cloneElement(children, mergeProps(slot, children.props));
}
