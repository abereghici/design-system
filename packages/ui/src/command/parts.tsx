"use client";

import { use, useId } from "react";
import type { ComponentProps } from "react";

import { join } from "../dialog/modal.tsx";
import { dispatchFeedback } from "../events/events.ts";
import { SearchIcon } from "../icon/icons/search.tsx";
import { Kbd } from "../kbd/kbd.tsx";
import { useLocale } from "../provider/locale.tsx";
import { composeRefs } from "../slot/slot.tsx";

import { DialogContext, enabled, useCommand } from "./root.tsx";
import styles from "./command.module.css";

export interface InputProps extends Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "type"
> {
  /** Overrides the Provider's locale: `search` is the accessible name, `placeholder` the default hint. */
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
  const text = { ...useLocale().labels.command, ...labels };
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

const optionOf = (target: EventTarget) =>
  target instanceof Element ? target.closest<HTMLElement>("[role=option]") : null;

export function List({
  className,
  ref,
  onMouseDown,
  onPointerMove,
  onClickCapture,
  ...props
}: ComponentProps<"div">) {
  const command = useCommand();
  const press = use(DialogContext);
  return (
    <div
      tabIndex={-1}
      {...props}
      ref={composeRefs(command.list, ref)}
      id={command.listId}
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a <select> can't be a text input's always-open popup of rich options at the Baseline floor (customizable select is limited).
      role="listbox"
      className={join(styles["list"], className)}
      onMouseDown={(event) => {
        onMouseDown?.(event);
        // Keeps DOM focus, and the caret, in the Input.
        event.preventDefault();
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        const option = optionOf(event.target);
        if (event.pointerType !== "touch" && option !== null && enabled(option))
          command.highlight(option.id);
      }}
      onClickCapture={(event) => {
        onClickCapture?.(event);
        const option = optionOf(event.target);
        if (option === null) return;
        if (!enabled(option)) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        press?.(event.nativeEvent, option);
        dispatchFeedback(option, "ab-confirm", { component: "Command", reason: "user" });
      }}
    />
  );
}

export interface GroupProps extends ComponentProps<"fieldset"> {
  /** The visible heading, and the group's accessible name. */
  heading: string;
}

export function Group({ heading, className, children, ...props }: GroupProps) {
  const id = useId();
  return (
    <fieldset aria-labelledby={id} {...props} className={join(styles["group"], className)}>
      <div id={id} aria-hidden="true" className={styles["heading"]}>
        {heading}
      </div>
      {children}
    </fieldset>
  );
}

export interface ItemProps extends ComponentProps<"div"> {
  /** The text the query is ranked against. Defaults to the Item's text without its Kbd. */
  value?: string;
  /** Extra words that match the query; not displayed. */
  keywords?: readonly string[];
  /** Shown, but never highlighted or run. */
  disabled?: boolean;
}

export function Item({ value, keywords = [], disabled = false, className, ...props }: ItemProps) {
  const { highlighted } = useCommand();
  const id = useId();
  return (
    <div
      {...props}
      id={id}
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- <option> is exposed as an option only inside <select> or <datalist>.
      role="option"
      aria-selected={highlighted === id || undefined}
      aria-disabled={disabled || undefined}
      data-highlighted={highlighted === id || undefined}
      data-value={value}
      data-keywords={keywords.length === 0 ? undefined : keywords.join("\n")}
      className={join(styles["item"], className)}
    />
  );
}

export interface EmptyProps extends ComponentProps<"output"> {
  /** Overrides the Provider's locale for the default text. */
  labels?: { empty?: string };
}

/** A polite live region, before the List, that shows its children while nothing matches. */
export function Empty({ labels, className, children, ...props }: EmptyProps) {
  const { empty } = useCommand();
  const locale = useLocale();
  const text = labels?.empty ?? locale.labels.command.empty;
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
  const text = { ...useLocale().labels.command, ...labels };
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
