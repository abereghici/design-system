"use client";

import type { ReactNode } from "react";

import { LocaleContext } from "./use-locale.ts";

export interface LocaleProviderProps {
  locale: string | undefined;
  children?: ReactNode;
}

/** Hands UIProvider's locale to client components, which a Server Component's context can't. */
export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return <LocaleContext value={locale}>{children}</LocaleContext>;
}
