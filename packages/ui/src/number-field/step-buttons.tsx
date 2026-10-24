"use client";

import type { SyntheticEvent } from "react";

import { IconButton } from "../icon-button/icon-button.tsx";
import { MinusIcon } from "../icon/icons/minus.tsx";
import { PlusIcon } from "../icon/icons/plus.tsx";
import { useLocale } from "../provider/locale.tsx";
import type { Labels } from "../provider/locale.tsx";

import { numberFieldLabels } from "./labels.ts";

export type Direction = 1 | -1;

export function StepButtons({
  labels,
  controls,
  disabled,
  onStep,
}: {
  labels: Partial<Labels["numberField"]> | undefined;
  controls: string | undefined;
  disabled: (direction: Direction) => boolean;
  onStep: (direction: Direction, event: SyntheticEvent) => void;
}) {
  const names = { ...numberFieldLabels, ...useLocale().labels.numberField, ...labels };
  return ([-1, 1] as const).map((direction) => (
    <IconButton
      key={direction}
      size="sm"
      tabIndex={-1}
      aria-label={direction === 1 ? names.increment : names.decrement}
      aria-controls={controls}
      disabled={disabled(direction)}
      onPointerDown={(event) => {
        event.preventDefault();
      }}
      onClick={(event) => {
        onStep(direction, event);
      }}
    >
      {direction === 1 ? <PlusIcon size="sm" /> : <MinusIcon size="sm" />}
    </IconButton>
  ));
}
