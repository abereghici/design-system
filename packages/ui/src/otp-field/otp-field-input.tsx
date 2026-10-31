"use client";

import { useState } from "react";
import type { ComponentProps, SyntheticEvent } from "react";

import { mergeProps } from "../internal/slot/slot.tsx";
import { Input as TextInput } from "../text-field/text-field-input.tsx";

/** The code's one input; `data-caret-end` marks its caret standing after the code's last digit. */
export function Input(props: ComponentProps<typeof TextInput>) {
  const [end, setEnd] = useState(false);

  function track(event: SyntheticEvent<HTMLInputElement>) {
    const { value, maxLength, selectionStart, selectionEnd } = event.currentTarget;

    setEnd(
      value.length === maxLength && selectionStart === maxLength && selectionEnd === maxLength,
    );
  }

  return (
    <TextInput {...mergeProps({ onSelect: track, "data-caret-end": end || undefined }, props)} />
  );
}
