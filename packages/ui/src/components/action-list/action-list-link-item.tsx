import { Children, cloneElement, isValidElement, useId } from "react";
import type { ComponentProps, ReactNode } from "react";

import { mergeProps } from "../../internal/utils/merge-props.ts";
import { Slot } from "../../internal/utils/slot.tsx";

import { Description } from "./action-list-description.tsx";
import type { DescriptionProps } from "./action-list-description.tsx";
import { LeadingVisual } from "./action-list-leading-visual.tsx";
import { TrailingVisual } from "./action-list-trailing-visual.tsx";
import styles from "./action-list.module.css";

interface LinkItemBase extends ComponentProps<"a"> {
  /** Where it goes; with `asChild`, the child carries it instead. */
  href?: string;
  /** Makes its one child, such as your router's link, the row's link. */
  asChild?: boolean;
}

export type LinkItemProps = LinkItemBase & ({ href: string; asChild?: false } | { asChild: true });

/**
 * One row: a link named by its text that covers the whole row, with its Description as its
 * description. Put the parts directly inside it, or inside your router's link with `asChild`.
 */
export function LinkItem({ asChild = false, children, ...props }: LinkItemProps) {
  const id = useId();
  const child = asChild && isValidElement<{ children?: ReactNode }>(children) ? children : null;
  const content = Children.toArray(child === null ? children : child.props.children);
  // Found by type among the row's children, as Primer's ActionList finds its slots.
  const part = (type: unknown) =>
    content.find((node) => isValidElement(node) && node.type === type);
  const leading = part(LeadingVisual);
  const trailing = part(TrailingVisual);
  const description = part(Description);
  const label = content.filter((node) => ![leading, trailing, description].includes(node));
  const link = {
    ...mergeProps({ className: styles["link"] }, props),
    "aria-describedby":
      props["aria-describedby"] ?? (description === undefined ? undefined : `${id}description`),
  };

  // Only the name is inside the link, which covers the row, so its name is the text it shows
  // (WCAG 2.5.3) and the Description is its description alone.
  return (
    <li className={styles["item"]}>
      {leading}
      {child === null ? (
        <a {...link}>{label}</a>
      ) : (
        <Slot {...link}>{cloneElement(child, undefined, label)}</Slot>
      )}
      {isValidElement<DescriptionProps>(description)
        ? cloneElement(description, { id: `${id}description` })
        : null}
      {trailing}
    </li>
  );
}
