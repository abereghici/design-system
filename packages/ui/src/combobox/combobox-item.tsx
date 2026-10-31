"use client";

import { Children, isValidElement, use } from "react";
import type { ComponentProps, ReactNode } from "react";

import "@abereghici/tokens/components/combobox.css";

import { CheckIcon } from "../icon/icons/check.tsx";
import { Option } from "../internal/listbox/listbox.tsx";
import { mergeProps } from "../internal/slot/slot.tsx";

import { ValueContext } from "./use-combobox.ts";
import styles from "./combobox.module.css";

export interface ItemProps extends ComponentProps<"div"> {
  /** What the form submits and `onValueChange` reports when this Item is chosen. */
  value: string;
  /** Aliases the typed text also matches, e.g. a nickname or a former name. */
  keywords?: ReadonlyArray<string>;
  /** Shown, so people know the option exists, but it can't be chosen. */
  disabled?: boolean;
}

const textOfNode = (node: ReactNode): string =>
  Children.toArray(node)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") return String(child);

      return isValidElement<{ children?: ReactNode }>(child)
        ? textOfNode(child.props.children)
        : "";
    })
    .join("");

/**
 * Each Item's text by its `value`, read from the elements rather than the page, so the server
 * renders the chosen labels too. An Item is any element with a string `value` prop, whatever its
 * element type.
 */
export function labelsOf(children: ReactNode, labels = new Map<string, string>()) {
  Children.forEach(children, (child) => {
    if (!isValidElement<Partial<ItemProps>>(child)) return;

    if (typeof child.props.value === "string") {
      labels.set(child.props.value, textOfNode(child.props.children).trim());
    } else {
      labelsOf(child.props.children, labels);
    }
  });

  return labels;
}

/** One choice. Its text content is its label: what the input or tag shows once chosen, and what ranks. */
export function Item({ value, children, ...props }: ItemProps) {
  const { chosen: values, multiple } = use(ValueContext);
  const chosen = values.includes(value);

  return (
    <Option
      {...mergeProps({ className: styles["option"] }, props)}
      aria-selected={multiple ? chosen : undefined}
      data-value={value}
      data-selected={chosen ? "" : undefined}
    >
      {children}
      <span className={styles["indicator"]}>{chosen && <CheckIcon size="sm" />}</span>
    </Option>
  );
}
