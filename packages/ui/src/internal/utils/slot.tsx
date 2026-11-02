import { cloneElement, isValidElement } from "react";
import type { HTMLAttributes, ReactElement, ReactNode, Ref } from "react";

import type { InvokerCommands } from "../types/invoker-commands.ts";

import { mergeProps } from "./merge-props.ts";

type Props = HTMLAttributes<HTMLElement> &
  InvokerCommands & {
    readonly ref?: Ref<HTMLElement> | undefined;
  };

/** Marks the consumer's child among a Slot's children: the Slot renders it, with the others inside. */
export function Slottable({ children }: { children: ReactNode }) {
  return children;
}

const isSlottable = (child: ReactNode): child is ReactElement<{ children: ReactNode }> =>
  isValidElement(child) && child.type === Slottable;

/**
 * Renders its only child with the slot's props merged in through `mergeProps`, the child as the
 * consumer. With a `Slottable` among its children, it renders the Slottable's child instead, its own
 * children placed where the Slottable is. While the slot is `aria-disabled`, the child's `onClick`
 * doesn't run.
 */
export function Slot({ children, ...slot }: Props) {
  const siblings = Array.isArray(children) ? (children as readonly ReactNode[]) : [];
  const slottable = siblings.find((child) => isSlottable(child));
  const element = slottable === undefined ? children : slottable.props.children;

  if (!isValidElement<Props>(element)) {
    throw new TypeError("asChild expects exactly one element child");
  }

  // A disabled button dispatches no click, so a disabled slot runs not the child's onClick either.
  const consumer =
    slot["aria-disabled"] === true ? { ...element.props, onClick: undefined } : element.props;
  const props = mergeProps(slot, consumer);

  if (slottable === undefined) return cloneElement(element, props);

  // Spread, so the siblings stay positional children that need no keys.
  return cloneElement(
    element,
    props,
    ...siblings.map((child) => (child === slottable ? element.props.children : child)),
  );
}
