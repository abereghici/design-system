"use client";

import { use } from "react";
import type { ComponentProps } from "react";

import { SearchIcon } from "../icon/icons/search.tsx";
import { Kbd } from "../kbd/kbd.tsx";
import { useLabels } from "../provider/locale.tsx";
import { command as commandLabels } from "../provider/locales/en-US/command.ts";
import { join } from "../slot/slot.tsx";

import { DialogContext, useCommand } from "./root.tsx";
import styles from "./command.module.css";

export interface InputProps extends Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "type"
> {
  /**
   * Overrides the Provider's locale: `search` is the accessible name, `placeholder` the default hint.
   * To name it by visible text, pass `aria-labelledby`, which wins over `search`.
   */
  labels?: { search?: string; placeholder?: string };
}

export function Input({
  labels,
  placeholder,
  className,
  onChange,
  onKeyDown,
  ...props
}: InputProps) {
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
        {...props}
        type="text"
        role="combobox"
        aria-expanded
        aria-controls={command.listId}
        aria-autocomplete="list"
        aria-activedescendant={command.highlighted ?? undefined}
        value={command.query}
        className={join(styles["input"], className)}
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

export interface EmptyProps extends ComponentProps<"output"> {
  /** Overrides the Provider's locale for the default text. */
  labels?: { empty?: string };
}

/** A polite live region, before the List, that shows its children while nothing matches. */
export function Empty({ labels, className, children, ...props }: EmptyProps) {
  const { empty } = useCommand();
  const text = useLabels("command", commandLabels, labels).empty;
  return (
    <output {...props} className={join(styles["empty"], className)}>
      {empty &&
        (children ?? (
          <>
            <SearchIcon size="xl" className={styles["emptyIcon"]} />
            <span>{text}</span>
          </>
        ))}
    </output>
  );
}

const hint = (keys: string, label: string) => (
  <span className={styles["hint"]}>
    <Kbd keys={keys} />
    {label}
  </span>
);

export interface FooterProps extends ComponentProps<"div"> {
  /** Overrides the Provider's locale for the key hints. */
  labels?: { navigate?: string; open?: string; close?: string };
}

/** Teaches the keys to sighted users; assistive technology gets them from the roles. */
export function Footer({ labels, className, children, ...props }: FooterProps) {
  const inDialog = use(DialogContext) !== null;
  const text = useLabels("command", commandLabels, labels);
  return (
    <div aria-hidden="true" {...props} className={join(styles["footer"], className)}>
      {children ?? (
        <>
          {hint("up+down", text.navigate)}
          {hint("enter", text.open)}
          {inDialog && hint("esc", text.close)}
        </>
      )}
    </div>
  );
}
