import { useId } from "react";
import type { ComponentProps } from "react";

import { mergeProps } from "../merge-props/merge-props.ts";

import type { ListboxNavigator } from "./use-listbox.ts";

/** The popup `navigator` drives. */
export function Listbox({
  navigator,
  ...props
}: ComponentProps<"div"> & { navigator: ListboxNavigator }) {
  return <div tabIndex={-1} {...mergeProps(navigator.listProps, props)} role="listbox" />;
}

export interface OptionProps extends ComponentProps<"div"> {
  disabled?: boolean | undefined;
  /** Aliases the query also ranks against. */
  keywords?: ReadonlyArray<string> | undefined;
  /** The text the query ranks against, else the option's own text. */
  label?: string | undefined;
}

/** An option; in a single-choice list, `aria-selected` marks the highlight, so leave it out. */
export function Option({
  "aria-selected": selected,
  disabled = false,
  keywords = [],
  label,
  ...props
}: OptionProps) {
  return (
    <div
      id={useId()}
      {...props}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      data-label={label}
      data-keywords={keywords.length === 0 ? undefined : keywords.join("\n")}
    />
  );
}

export interface OptionGroupProps extends ComponentProps<"fieldset"> {
  /** The group's visible heading, which also names it. */
  heading: string;
  headingClassName: string | undefined;
}

/** Options under a heading; it hides while none of them shows. */
export function OptionGroup({ heading, headingClassName, children, ...props }: OptionGroupProps) {
  const id = useId();

  return (
    <fieldset aria-labelledby={id} {...props}>
      <div id={id} aria-hidden="true" className={headingClassName}>
        {heading}
      </div>
      {children}
    </fieldset>
  );
}
