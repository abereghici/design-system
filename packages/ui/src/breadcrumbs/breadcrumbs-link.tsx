import { Link as BaseLink } from "../link/link.tsx";
import type { LinkProps as BaseLinkProps } from "../link/link.tsx";
import { join } from "../slot/slot.tsx";

import styles from "./breadcrumbs.module.css";

export type LinkProps = BaseLinkProps;

/** A Link to an ancestor page. Set `aria-current="page"` on the current page's link. */
export function Link({ className, ...props }: LinkProps) {
  return <BaseLink {...props} className={join(styles["link"], className)} />;
}
