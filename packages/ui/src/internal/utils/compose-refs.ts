import type { Ref, RefCallback } from "react";

function assign<T>(ref: Ref<T> | undefined, node: T | null): ReturnType<RefCallback<T>> {
  if (typeof ref === "function") return ref(node);

  if (ref) ref.current = node;
}

// Cached per pair so stable refs compose into a stable callback, and React doesn't detach and reattach on every render.
const composed = new WeakMap<object, WeakMap<object, RefCallback<never>>>();

/** Gives the element to both refs, as Radix's `composeRefs` does, and runs their cleanups. */
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
