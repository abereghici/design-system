import type { CSSProperties } from "react";

import styles from "./token-table.module.css";

interface TokenRow {
  readonly name: string;
  readonly value: string | { readonly light: string; readonly dark: string };
  readonly usage?: string;
}

interface TokenTableProps {
  readonly tokens: readonly TokenRow[];
  /** Styles a sample box with the token, as `var(--<name>)`. */
  readonly preview?: (cssVar: string) => CSSProperties;
}

/** One row per token: its CSS name, its value in each Theme and its usage. */
export function TokenTable({ tokens, preview }: TokenTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th scope="col">Token</th>
          <th scope="col">Value</th>
          <th scope="col">Usage</th>
        </tr>
      </thead>
      <tbody>
        {tokens.map(({ name, value, usage }) => (
          <tr key={name}>
            <th scope="row">
              <code>--{name}</code>
            </th>
            <td>
              {typeof value === "string" ? value : `${value.light} light · ${value.dark} dark`}
              {preview && (
                <span
                  aria-hidden="true"
                  className={styles["sample"]}
                  style={preview(`var(--${name})`)}
                />
              )}
            </td>
            <td>{usage}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
