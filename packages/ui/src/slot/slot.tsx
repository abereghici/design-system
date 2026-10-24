import { cloneElement, isValidElement } from "react";
import type { HTMLAttributes, Ref, RefCallback } from "react";

type Props = HTMLAttributes<HTMLElement> & { readonly ref?: Ref<HTMLElement> | undefined };

type Handler = (...args: unknown[]) => unknown;

const isHandler = (value: unknown): value is Handler => typeof value === "function";

function assign(
  ref: Ref<HTMLElement> | undefined,
  node: HTMLElement | null,
): ReturnType<RefCallback<HTMLElement>> {
  if (typeof ref === "function") return ref(node);
  if (ref) ref.current = node;
}

function composeRefs(...refs: (Ref<HTMLElement> | undefined)[]): RefCallback<HTMLElement> {
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
