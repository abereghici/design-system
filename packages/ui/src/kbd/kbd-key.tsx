"use client";

import { useSyncExternalStore } from "react";

import { VisuallyHidden } from "../visually-hidden/visually-hidden.tsx";

export type KeyLabel =
  | "command"
  | "control"
  | "shift"
  | "option"
  | "enter"
  | "backspace"
  | "arrowUp"
  | "arrowDown"
  | "arrowLeft"
  | "arrowRight";

export interface KbdFace {
  readonly text: string;
  readonly label?: KeyLabel;
}

const subscribe = () => () => {};

export const platform = () =>
  /^(?:Mac|iPhone|iPad)/v.test(navigator.platform) ? ("apple" as const) : ("other" as const);

const serverPlatform = () => "other" as const;

export function KbdKey({
  apple,
  other,
  keyLabels,
}: {
  apple: KbdFace;
  other: KbdFace;
  keyLabels: Partial<Record<KeyLabel, string>> | undefined;
}) {
  const face =
    useSyncExternalStore(subscribe, platform, serverPlatform) === "apple" ? apple : other;
  const name = face.label === undefined ? undefined : keyLabels?.[face.label];

  if (name === undefined) return face.text;

  return (
    <>
      <span aria-hidden="true">{face.text}</span>
      <VisuallyHidden>{name}</VisuallyHidden>
    </>
  );
}
