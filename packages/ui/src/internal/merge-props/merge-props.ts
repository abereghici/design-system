import type { Ref } from "react";

import { composeRefs } from "../compose-refs/compose-refs.ts";

type Handler = (...args: unknown[]) => unknown;

const isHandler = (value: unknown): value is Handler => typeof value === "function";

const isObject = (value: unknown): value is object => typeof value === "object" && value !== null;

const isRef = (value: unknown): value is Ref<unknown> => isHandler(value) || isObject(value);

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
