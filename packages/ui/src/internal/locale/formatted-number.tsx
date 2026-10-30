"use client";

import { useLocale } from "./use-locale.ts";

export type FormattedNumberProps = Intl.NumberFormatOptions & { value: number };

/**
 * A number in the app's locale. A client leaf, so a Server Component formats in the same locale as
 * the browser and hydration matches.
 */
export function FormattedNumber({ value, ...options }: FormattedNumberProps) {
  return new Intl.NumberFormat(useLocale(), options).format(value);
}
