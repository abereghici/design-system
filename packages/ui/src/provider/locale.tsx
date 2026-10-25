"use client";

import { createContext, use } from "react";
import type { ReactNode } from "react";

import type { enUS } from "./locales/en-US.ts";

/** Every component's built-in strings, in the shape en-US composes from each one's defaults. */
export type Labels = (typeof enUS)["labels"];

export interface Locale {
  readonly tag: string;
  readonly labels: Labels;
}

const LocaleContext = createContext<Locale | undefined>(undefined);

export function LocaleProvider({ value, children }: { value: Locale; children: ReactNode }) {
  return <LocaleContext value={value}>{children}</LocaleContext>;
}

/**
 * A component's Built-in labels: the consumer's `labels` over the Provider's Locale over the en-US
 * `defaults` the component imports itself, so each component ships only its own namespace. A
 * Server Component can't read the Provider; it spreads its `locale` prop in the same order.
 */
export function useLabels<Namespace extends keyof Labels>(
  namespace: Namespace,
  defaults: Labels[Namespace],
  labels?: Partial<Labels[Namespace]>,
): Labels[Namespace] {
  return { ...defaults, ...useLocale().labels[namespace], ...labels };
}

/** The Provider's `locale`, or en-US with no labels so each component falls back to its own. */
export function useLocale(): { readonly tag: string; readonly labels: Partial<Labels> } {
  return use(LocaleContext) ?? { tag: "en-US", labels: {} };
}
