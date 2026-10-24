import { cloneElement, isValidElement } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, Ref, RefCallback } from "react";

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

type Handler = (...args: unknown[]) => unknown;

const isHandler = (value: unknown): value is Handler => typeof value === "function";

function assign<T>(ref: Ref<T> | undefined, node: T | null): ReturnType<RefCallback<T>> {
  if (typeof ref === "function") return ref(node);
  if (ref) ref.current = node;
}

export function composeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    const cleanups = refs.map((ref) => assign(ref, node));
    return () => {
      for (const [index, cleanup] of cleanups.entries()) {
        if (typeof cleanup === "function") cleanup();
        else assign(refs[index], null);
      }
    };
  };
}

/** Renders its only child with the slot's props merged in: the child's props win, handlers run child first, refs and classes combine. */
export function Slot({ children, ...slot }: Props) {
  if (!isValidElement<Props>(children)) {
    throw new TypeError("asChild expects exactly one element child");
  }
  const child = children.props;
  const childProps: Record<string, unknown> = { ...child };
  const merged: Record<string, unknown> = { ...slot, ...child };
  for (const [key, value] of Object.entries(slot)) {
    const own = childProps[key];
    if (/^on[A-Z]/v.test(key) && isHandler(value) && isHandler(own)) {
      merged[key] = (...args: unknown[]) => {
        own(...args);
        value(...args);
      };
    }
  }
  merged["className"] = [slot.className, child.className].filter(Boolean).join(" ") || undefined;
  if (slot.style && child.style) merged["style"] = { ...slot.style, ...child.style };
  // A callback ref is not serialisable, so compose only when both sides hold one; a lone ref passes through and Server Components keep working.
  if (slot.ref && child.ref) merged["ref"] = composeRefs(slot.ref, child.ref);
  return cloneElement(children, merged);
}
