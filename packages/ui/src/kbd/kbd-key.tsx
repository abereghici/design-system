"use client";

import { useSyncExternalStore } from "react";

import { useLabels } from "../provider/locale.tsx";
import type { Labels } from "../provider/locale.tsx";
import { kbd as kbdLabels } from "../provider/locales/en-US/kbd.ts";
import { VisuallyHidden } from "../visually-hidden/visually-hidden.tsx";

export interface KbdFace {
  readonly text: string;
  readonly label?: keyof Labels["kbd"];
}

const subscribe = () => () => {};
export const platform = () =>
  /^(?:Mac|iPhone|iPad)/v.test(navigator.platform) ? ("apple" as const) : ("other" as const);
const serverPlatform = () => "other" as const;

export function KbdKey({
  apple,
  other,
  labels,
}: {
  apple: KbdFace;
  other: KbdFace;
  labels: Partial<Labels["kbd"]> | undefined;
}) {
  const face =
    useSyncExternalStore(subscribe, platform, serverPlatform) === "apple" ? apple : other;
  const names = useLabels("kbd", kbdLabels, labels);
  if (face.label === undefined) return face.text;
  return (
    <>
      <span aria-hidden="true">{face.text}</span>
      <VisuallyHidden>{names[face.label]}</VisuallyHidden>
    </>
  );
}
