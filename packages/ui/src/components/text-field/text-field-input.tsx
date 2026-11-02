"use client";

import { InputGroupInput } from "../../internal/components/input-group/input-group-input.tsx";
import * as Field from "../field/field.tsx";

export function Input({ readOnly, ...props }: Field.ControlProps) {
  const bindings = Field.useFieldControl<HTMLInputElement, typeof props>(props);

  return <InputGroupInput {...bindings} readOnly={bindings["aria-disabled"] ?? readOnly} />;
}
