"use client";

import { useLocale } from "@platform/ui/provider";

export function ShowLocale() {
  return <output>{useLocale().tag}</output>;
}
