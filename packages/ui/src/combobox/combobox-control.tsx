"use client";

import type { ComponentProps, ReactNode } from "react";

import "@abereghici/tokens/components/field.css";

import * as Field from "../field/field.tsx";
import { SearchIcon } from "../icon/icons/search.tsx";
import * as TagGroup from "../tag-group/tag-group.tsx";
import { InputGroup } from "../text-field/text-field-input-group.tsx";

import { changeValues, inputOf, inputProps, part, press } from "./combobox-state.ts";
import type { ComboboxState } from "./combobox-state.ts";
import textFieldStyles from "../text-field/text-field.module.css";
import styles from "./combobox.module.css";

function Input({ readOnly, className, ...props }: Field.ControlProps) {
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
      className={[textFieldStyles["input"], className].filter(Boolean).join(" ")}
    />
  );
}

interface TagsProps {
  c: ComboboxState;
  naming: Pick<ComponentProps<"ul">, "aria-labelledby" | "aria-label">;
  removeLabel: string;
  labels: ReadonlyMap<string, string>;
}

/** The chosen Items as tags; removing one returns focus to the input. */
export function Tags({ c, naming, removeLabel, labels }: TagsProps) {
  if (c.value.length === 0) return null;

  return (
    <TagGroup.Root
      {...naming}
      value={c.value}
      removeLabel={removeLabel}
      disabled={c.options.disabled === true}
      onValueChange={(next, details) => {
        if (changeValues(c, next, "remove-press", details.event)) inputOf(c)?.focus();
        else details.cancel();
      }}
    >
      {c.value.map((value) => (
        <TagGroup.Tag key={value} value={value}>
          {labels.get(value) ?? value}
        </TagGroup.Tag>
      ))}
    </TagGroup.Root>
  );
}

/**
 * The field box: a search icon, the chosen tags if any, and the input, which a press anywhere on
 * the box focuses.
 */
export function Control({
  c,
  input,
  tags,
}: {
  c: ComboboxState;
  input: Field.ControlProps;
  tags: ReactNode;
}) {
  const field = (
    <Input
      {...inputProps(c, input)}
      // With several choices the text is empty once chosen, so only the choices meet `required`.
      required={
        tags === undefined ? input.required : input.required === true && c.value.length === 0
      }
      className={tags === undefined ? undefined : styles["input"]}
      aria-expanded={c.open}
      aria-controls={part(c, "list")}
    />
  );

  return (
    <InputGroup
      id={part(c, "box")}
      className={tags === undefined ? undefined : styles["multiple"]}
      start={<SearchIcon />}
      end={undefined}
      onPointerDown={(event) => {
        if (!(event.target instanceof Element && event.target.closest("button, [tabindex]"))) {
          press(c, event.nativeEvent);
        }
      }}
    >
      {tags === undefined ? (
        field
      ) : (
        <span className={styles["values"]}>
          {tags}
          {field}
        </span>
      )}
    </InputGroup>
  );
}
