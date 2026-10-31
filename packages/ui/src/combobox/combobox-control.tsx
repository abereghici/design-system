"use client";

import type { ComponentProps } from "react";

import "@abereghici/tokens/components/field.css";

import * as Field from "../field/field.tsx";
import { SearchIcon } from "../icon/icons/search.tsx";
import { useHydrated } from "../internal/hydration/use-hydrated.ts";
import * as TagGroup from "../tag-group/tag-group.tsx";
import { InputGroup } from "../text-field/text-field-input-group.tsx";

import { changeValues, inputOf } from "./use-combobox-state.ts";
import type { Combobox } from "./use-combobox.ts";
import textFieldStyles from "../text-field/text-field.module.css";
import styles from "./combobox.module.css";

function Input({
  readOnly,
  className,
  submitsText,
  ...props
}: Field.ControlProps & { submitsText: boolean }) {
  const bindings = Field.useFieldControl<HTMLInputElement, typeof props>(props);

  return (
    <input
      dir="auto"
      autoComplete="off"
      {...bindings}
      name={submitsText ? bindings.name : undefined}
      role="combobox"
      aria-autocomplete="list"
      aria-expanded={props["aria-expanded"]}
      aria-controls={props["aria-controls"]}
      readOnly={bindings["aria-disabled"] ?? readOnly}
      className={[textFieldStyles["input"], className].filter(Boolean).join(" ")}
    />
  );
}

type Naming = Pick<ComponentProps<"ul">, "aria-labelledby" | "aria-label">;

interface TagsProps {
  c: Combobox;
  naming: Naming;
  labels: ReadonlyMap<string, string>;
}

/** The chosen Items as tags; removing one returns focus to the input. */
function Tags({ c, naming, labels }: TagsProps) {
  const { options } = c;

  if (options.selectionMode !== "multiple" || c.value.length === 0) return null;

  return (
    <TagGroup.Root
      {...naming}
      value={c.value}
      removeLabel={options.removeLabel}
      disabled={options.disabled === true}
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

interface ControlProps extends Omit<TagsProps, "c"> {
  c: Combobox;
  input: Field.ControlProps;
}

/**
 * The field box: a search icon, the chosen tags if any, and the input, which a press anywhere on
 * the box focuses.
 */
export function Control({ c, input, naming, labels }: ControlProps) {
  const { multiple } = c;
  const hydrated = useHydrated();
  const field = (
    <Input
      {...c.inputProps(input)}
      // Until hydration the input is a plain text field, so one choice submits what is typed;
      // several choices submit their tags, since typing only filters.
      submitsText={!multiple && !hydrated}
      // With several choices the text is empty once chosen, so only the choices meet `required`.
      required={multiple ? input.required === true && c.value.length === 0 : input.required}
      className={multiple ? styles["input"] : undefined}
    />
  );

  return (
    <InputGroup
      {...c.boxProps}
      className={multiple ? styles["multiple"] : undefined}
      start={<SearchIcon />}
      end={undefined}
    >
      {multiple ? (
        <span className={styles["values"]}>
          <Tags c={c} naming={naming} labels={labels} />
          {field}
        </span>
      ) : (
        field
      )}
    </InputGroup>
  );
}
