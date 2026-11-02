"use client";

import type { ComponentProps } from "react";

import { InputBase } from "../../internal/components/input-base/input-base.tsx";

import { useFieldControl } from "./use-field.ts";
import type { ChangeEventDetails } from "./use-field.ts";

export interface ControlProps extends ComponentProps<"input"> {
  /** Called as the user types, with the new text. */
  onValueChange?: (value: string, details: ChangeEventDetails) => void;
  /**
   * Stops editing but keeps the text focusable and selectable, so it can still be read and copied.
   */
  disabled?: boolean;
}

/** The text input, named and described by its Field. */
export function Control({ readOnly, ...props }: ControlProps) {
  const bindings = useFieldControl<HTMLInputElement, typeof props>(props);

  return (
    <InputBase>
      <input {...bindings} readOnly={bindings["aria-disabled"] ?? readOnly} />
    </InputBase>
  );
}
