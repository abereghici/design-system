import type { ComponentProps } from "react";

import styles from "./table.module.css";

const join = (own: string | undefined, className: string | undefined) =>
  className === undefined ? own : `${own} ${className}`;

/**
 * A static data table on the native `<table>`. Name it with `Caption`, `aria-labelledby` or
 * `aria-label`. Never change the `display` of its parts: some browsers then drop the table
 * semantics. Put a wide table inside a ScrollArea.
 */
export function Root({ className, ...props }: ComponentProps<"table">) {
  return <table {...props} className={join(styles["root"], className)} />;
}

export function Caption({ className, ...props }: ComponentProps<"caption">) {
  return <caption {...props} className={join(styles["caption"], className)} />;
}

export function Header(props: ComponentProps<"thead">) {
  return <thead {...props} />;
}

export function Body({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody {...props} className={join(styles["body"], className)} />;
}

export function Row({ className, ...props }: ComponentProps<"tr">) {
  return <tr {...props} className={join(styles["row"], className)} />;
}

export function ColumnHeader({ className, ...props }: ComponentProps<"th">) {
  return <th scope="col" {...props} className={join(styles["column-header"], className)} />;
}

export function RowHeader({ className, ...props }: ComponentProps<"th">) {
  return <th scope="row" {...props} className={join(styles["cell"], className)} />;
}

export function Cell({ className, ...props }: ComponentProps<"td">) {
  return <td {...props} className={join(styles["cell"], className)} />;
}
