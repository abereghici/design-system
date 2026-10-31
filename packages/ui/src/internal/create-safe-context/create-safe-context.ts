import { createContext, use } from "react";

/**
 * A Context and the hook that reads it, as Mantine's `createSafeContext` returns them. Outside its
 * provider the hook throws `<part> must be inside <root>`, naming the Part that called it, as
 * Radix's message does.
 */
export function createSafeContext<Value>(root: string) {
  const SafeContext = createContext<Value | null>(null);

  function useSafeContext(part: string): Value {
    const value = use(SafeContext);

    if (value === null) throw new Error(`${part} must be inside ${root}`);

    return value;
  }

  return [SafeContext, useSafeContext] as const;
}
