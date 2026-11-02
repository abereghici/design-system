"use client";

import type { SyntheticEvent } from "react";

import { IconButton } from "../icon-button/icon-button.tsx";
import { MinusIcon } from "../icon/icons/minus.tsx";
import { PlusIcon } from "../icon/icons/plus.tsx";

import styles from "./number-field.module.css";

export type Direction = 1 | -1;

export function StepButtons({
  incrementLabel,
  decrementLabel,
  controls,
  disabled,
  onStep,
}: {
  incrementLabel: string;
  decrementLabel: string;
  controls: string | undefined;
  disabled: (direction: Direction) => boolean;
  onStep: (direction: Direction, event: SyntheticEvent) => void;
}) {
  return ([-1, 1] as const).map((direction) => (
    <IconButton
      key={direction}
      size="sm"
      className={styles["step"]}
      tabIndex={-1}
      aria-label={direction === 1 ? incrementLabel : decrementLabel}
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
