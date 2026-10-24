"use client";

import { createContext, use } from "react";
import type { ReactNode } from "react";

import { enUS } from "./locales/en-US.ts";

export interface Labels {
  readonly spinner: { readonly loading: string };
}

export interface Locale {
  readonly tag: string;
  readonly labels: Labels;
}

const LocaleContext = createContext<Locale | undefined>(undefined);

export function LocaleProvider({ value, children }: { value: Locale; children: ReactNode }) {
  return <LocaleContext value={value}>{children}</LocaleContext>;
}

export function useLocale(): Locale {
  const locale = use(LocaleContext);
  if (locale !== undefined) return locale;
  const lang = typeof document === "undefined" ? "" : document.documentElement.lang;
  return lang === "" ? enUS : { ...enUS, tag: lang };
}
