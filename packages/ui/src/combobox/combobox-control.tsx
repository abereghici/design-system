"use client";

import * as Field from "../field/field.tsx";
import { SearchIcon } from "../icon/icons/search.tsx";
import { InputGroup } from "../text-field/text-field-input-group.tsx";

import { inputProps, part, press } from "./combobox-state.ts";
import type { ComboboxState } from "./combobox-state.ts";
import textFieldStyles from "../text-field/text-field.module.css";

function Input({ readOnly, ...props }: Field.ControlProps) {
  const bindings = Field.useFieldControl<HTMLInputElement, typeof props>(props);

  return (
    <input
      dir="auto"
      autoComplete="off"
      {...bindings}
      name={undefined}
      role="combobox"
      aria-autocomplete="list"
      aria-expanded={props["aria-expanded"]}
      aria-controls={props["aria-controls"]}
      readOnly={bindings["aria-disabled"] ?? readOnly}
      className={textFieldStyles["input"]}
    />
  );
}

/** The field box: a search icon and the input, which a press anywhere on the box focuses. */
export function Control({ c, input }: { c: ComboboxState; input: Field.ControlProps }) {
  return (
    <InputGroup
      id={part(c, "box")}
      start={<SearchIcon />}
      end={undefined}
      onPointerDown={(event) => {
        press(c, event.nativeEvent);
      }}
    >
      <Input {...inputProps(c, input)} aria-expanded={c.open} aria-controls={part(c, "list")} />
    </InputGroup>
  );
}
