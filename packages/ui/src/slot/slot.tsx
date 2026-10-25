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

const isObject = (value: unknown): value is object => typeof value === "object" && value !== null;

const isRef = (value: unknown): value is Ref<unknown> => isHandler(value) || isObject(value);

function assign<T>(ref: Ref<T> | undefined, node: T | null): ReturnType<RefCallback<T>> {
  if (typeof ref === "function") return ref(node);

  if (ref) ref.current = node;
}

// Cached per pair so stable refs compose into a stable callback, and React doesn't detach and reattach on every render.
const composed = new WeakMap<object, WeakMap<object, RefCallback<never>>>();

export function composeRefs<T>(own: Ref<T>, consumer: Ref<T> | undefined): Ref<T> | undefined {
  if (!own || !consumer) return own ?? consumer ?? undefined;

  const pairs = composed.get(own) ?? new WeakMap<object, RefCallback<T>>();

  composed.set(own, pairs);

  const cached = pairs.get(consumer);

  if (cached) return cached;

  const ref: RefCallback<T> = (node) => {
    const cleanups = [assign(own, node), assign(consumer, node)];

    return () => {
      for (const [index, cleanup] of cleanups.entries()) {
        if (typeof cleanup === "function") cleanup();
        else assign(index === 0 ? own : consumer, null);
      }
    };
  };

  pairs.set(consumer, ref);

  return ref;
}

const presences = new WeakMap<(present: boolean) => void, RefCallback<Element>>();

/** A ref that tells `set` whether its element is mounted, so a part can announce itself to its Root. */
export function presenceRef(set: (present: boolean) => void): RefCallback<Element> {
  const cached = presences.get(set);

  if (cached) return cached;

  const ref: RefCallback<Element> = (node) => {
    set(node !== null);
  };

  presences.set(set, ref);

  return ref;
}

/**
 * Merges a component's own props with the consumer's, as React Aria and Base UI do: the consumer's
 * win and `undefined` never overrides, classes join, styles merge, both handlers run (the consumer's
 * first) and both refs receive the element.
 */
export function mergeProps<Own extends object, Consumer extends object>(
  own: Own,
  consumer: Consumer,
): Own & Consumer;

export function mergeProps(own: object, consumer: object): object {
  const merged: Record<string, unknown> = { ...own };

  for (const [key, value] of Object.entries(consumer)) {
    const mine = merged[key];

    if (value === undefined) continue;

    if (mine === undefined) merged[key] = value;
    else if (key === "className")
      merged[key] = [mine, value].filter(Boolean).join(" ") || undefined;
    else if (key === "style" && isObject(mine) && isObject(value))
      merged[key] = { ...mine, ...value };
    // A callback ref is not serialisable, so compose only when both sides hold one; a lone ref passes through and Server Components keep working.
    else if (key === "ref" && isRef(mine) && isRef(value)) merged[key] = composeRefs(mine, value);
    else if (/^on[A-Z]/v.test(key) && isHandler(mine) && isHandler(value)) {
      merged[key] = (...args: unknown[]) => {
        value(...args);
        mine(...args);
      };
    } else merged[key] = value;
  }

  return merged;
}

/** Renders its only child with the slot's props merged in through `mergeProps`, the child as the consumer. */
export function Slot({ children, ...slot }: Props) {
  if (!isValidElement<Props>(children)) {
    throw new TypeError("asChild expects exactly one element child");
  }

  return cloneElement(children, mergeProps(slot, children.props));
}
