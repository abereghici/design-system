import "@abereghici/tokens/components/breadcrumbs.css";

import { mergeProps } from "../internal/slot/slot.tsx";
import { Link as BaseLink } from "../link/link.tsx";
import type { LinkProps as BaseLinkProps } from "../link/link.tsx";

import styles from "./breadcrumbs.module.css";

export type LinkProps = BaseLinkProps;

/** A Link to an ancestor page. Set `aria-current="page"` on the current page's link. */
export function Link(props: LinkProps) {
  return <BaseLink {...mergeProps({ className: styles["link"] }, props)} />;
}
