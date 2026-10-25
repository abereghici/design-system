"use client";

import { use } from "react";
import type { ComponentProps } from "react";

import { trackComposition } from "../events/events.ts";
import { SearchIcon } from "../icon/icons/search.tsx";
import { Kbd } from "../kbd/kbd.tsx";
import { mergeProps } from "../slot/slot.tsx";
import { useLabels } from "../ui-provider/locale.tsx";
import { command as commandLabels } from "../ui-provider/locales/en-US/command.ts";

import { DialogContext, useCommand } from "./command-root.tsx";
import styles from "./command.module.css";

export interface InputProps extends Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "type"
> {
  /**
   * Overrides the UIProvider's locale: `search` is the accessible name, `placeholder` the default hint.
   * To name it by visible text, pass `aria-labelledby`, which wins over `search`.
   */
  labels?: { search?: string; placeholder?: string };
}

export function Input({ labels, placeholder, onChange, onKeyDown, ...props }: InputProps) {
  const command = useCommand();
  const inDialog = use(DialogContext) !== null;
  const text = useLabels("command", commandLabels, labels);
  return (
    <label className={styles["search"]}>
      <SearchIcon className={styles["searchIcon"]} />
      <input
        placeholder={placeholder ?? text.placeholder}
        aria-label={text.search}
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
