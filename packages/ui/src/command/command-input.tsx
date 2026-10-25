"use client";

import { use } from "react";
import type { ComponentProps } from "react";

import { trackComposition } from "../events/events.ts";
import { SearchIcon } from "../icon/icons/search.tsx";
import { Kbd } from "../kbd/kbd.tsx";
import { join } from "../slot/slot.tsx";

import { DialogContext, useCommand } from "./command-root.tsx";
import styles from "./command.module.css";

type Naming =
  | {
      /** The search field's name, such as "Search commands". */
      "aria-label": string;
    }
  | {
      /** The `id` of visible text that names the search field. */
      "aria-labelledby": string;
    };

export type InputProps = Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "type" | "aria-label" | "aria-labelledby"
> &
  Naming;

export function Input({ className, onChange, onKeyDown, ...props }: InputProps) {
  const command = useCommand();
  const inDialog = use(DialogContext) !== null;
  return (
    <label className={styles["search"]}>
      <SearchIcon className={styles["searchIcon"]} />
      <input
        autoComplete="off"
        spellCheck={false}
        {...props}
        type="text"
        role="combobox"
        aria-expanded
        aria-controls={command.listId}
        aria-autocomplete="list"
        aria-activedescendant={command.highlighted ?? undefined}
        value={command.query}
        className={join(styles["input"], className)}
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
