import type { ReactNode } from "react";

import styles from "./docs.module.css";
import { describe, type ThemeId, type Token } from "./tokens.ts";

export const THEME_IDS = ["light", "dark"] as const satisfies readonly ThemeId[];

export const cssVar = (name: string) => `var(--ab-${name})`;

export function Section({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className={styles["section"]} aria-label={title}>
      <h2 className={styles["heading"]}>{title}</h2>
      {lead === undefined ? null : <p className={styles["lead"]}>{lead}</p>}
      {children}
    </section>
  );
}

function TokenValue({ token }: { token: Token }) {
  const media = Object.entries(token.media);
  return (
    <>
      {token.dark === undefined ? (
        <code>{describe(token.value)}</code>
      ) : (
        <>
          <code>{describe(token.value)}</code> light · <code>{describe(token.dark)}</code> dark
        </>
      )}
      {media.map(([query, value]) => (
        <span key={query} className={styles["media"]}>
          <code>{query}</code>: <code>{describe(value)}</code>
        </span>
      ))}
    </>
  );
}

export function TokenTable({
  caption,
  rows,
  preview,
}: {
  caption: string;
  rows: readonly Token[];
  preview?: (token: Token) => ReactNode;
}) {
  return (
    <table className={styles["table"]}>
      <caption className={styles["caption"]}>{caption}</caption>
      <thead>
        <tr>
          {preview === undefined ? null : <th scope="col">Preview</th>}
          <th scope="col">Token</th>
          <th scope="col">Value</th>
          <th scope="col">Usage</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name}>
            {preview === undefined ? null : <td className={styles["preview"]}>{preview(row)}</td>}
            <th scope="row">
              <code>--ab-{row.name}</code>
            </th>
            <td>
              <TokenValue token={row} />
            </td>
            <td className={styles["usage"]}>{row.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function InEachTheme({ children }: { children: ReactNode }) {
  return (
    <span className={styles["themes"]}>
      {THEME_IDS.map((theme) => (
        <span key={theme} data-theme={theme} className={styles["theme"]}>
          {children}
        </span>
      ))}
    </span>
  );
}

export function Chip({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className={styles["swatch"]}
      style={{ backgroundColor: cssVar(name) }}
    />
  );
}

export function Swatch({ name }: { name: string }) {
  return (
    <InEachTheme>
      <Chip name={name} />
    </InEachTheme>
  );
}

export function Rules({ items }: { items: readonly (readonly [string, string])[] }) {
  return (
    <dl className={styles["rules"]}>
      {items.map(([term, text]) => (
        <div key={term}>
          <dt>{term}</dt>
          <dd>{text}</dd>
        </div>
      ))}
    </dl>
  );
}
