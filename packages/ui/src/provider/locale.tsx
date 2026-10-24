"use client";

import { createContext, use } from "react";
import type { ReactNode } from "react";

import { enUS } from "./locales/en-US.ts";

export interface Labels {
  readonly alert: { readonly close: string };
  readonly spinner: { readonly loading: string };
  readonly kbd: {
    readonly command: string;
    readonly control: string;
    readonly shift: string;
    readonly option: string;
    readonly enter: string;
    readonly backspace: string;
    readonly arrowUp: string;
    readonly arrowDown: string;
    readonly arrowLeft: string;
    readonly arrowRight: string;
  };
  readonly skipLink: { readonly label: string };
  readonly passwordField: { readonly show: string };
  readonly numberField: { readonly increment: string; readonly decrement: string };
  readonly breadcrumbs: { readonly root: string };
  readonly pagination: { readonly root: string; readonly previous: string; readonly next: string };
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
