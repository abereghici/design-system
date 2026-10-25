"use client";

import { useLocale } from "@platform/ui/ui-provider";

export function ShowLocale() {
  return <output>{useLocale().tag}</output>;
}
