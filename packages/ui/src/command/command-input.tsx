"use client";

import { use } from "react";
import type { ComponentProps } from "react";

import { trackComposition } from "../events/events.ts";
import { SearchIcon } from "../icon/icons/search.tsx";
import { Kbd } from "../kbd/kbd.tsx";
import { mergeProps } from "../slot/slot.tsx";

import { DialogContext, useCommand } from "./command-root.tsx";
import styles from "./command.module.css";

interface Name {
  /** The search field's name, such as "Search commands". */
  "aria-label"?: string;
  /** The `id` of visible text that names the search field. */
  "aria-labelledby"?: string;
}

type Naming = { "aria-label": string } | { "aria-labelledby": string };

export type InputProps = Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "type" | "aria-label" | "aria-labelledby"
> &
  Name &
  Naming;

/** The search field; arrow keys move the highlight, Enter runs it. */
export function Input({ onChange, onKeyDown, ...props }: InputProps) {
  const command = useCommand();
  const inDialog = use(DialogContext) !== null;

  return (
    <label className={styles["search"]}>
      <SearchIcon className={styles["searchIcon"]} />
      <input
        autoComplete="off"
        spellCheck={false}
        {...mergeProps({ className: styles["input"] }, props)}
        type="text"
        role="combobox"
        aria-expanded
        aria-controls={command.listId}
        aria-autocomplete="list"
        aria-activedescendant={command.highlighted ?? undefined}
        value={command.query}
        onCompositionEnd={trackComposition(props.onCompositionEnd)}
        onChange={(event) => {
          onChange?.(event);
          command.change(event.currentTarget.value, event.nativeEvent);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);

          if (!event.defaultPrevented) command.keyDown(event);
        }}
      />
      {inDialog && <Kbd keys="esc" aria-hidden />}
    </label>
  );
}
