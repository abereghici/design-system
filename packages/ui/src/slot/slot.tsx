import { cloneElement, isValidElement, type HTMLAttributes } from "react";

export function Slot({ className, children, ...props }: HTMLAttributes<HTMLElement>) {
  if (!isValidElement<HTMLAttributes<HTMLElement>>(children)) {
    throw new TypeError("asChild expects exactly one element child");
  }
  const own = children.props.className;
  return cloneElement(children, {
    ...props,
    ...children.props,
    className: own === undefined ? className : `${className ?? ""} ${own}`.trim(),
  });
}
