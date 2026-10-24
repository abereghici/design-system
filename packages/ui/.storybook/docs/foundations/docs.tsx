// Building blocks of the foundations pages (Storybook only; not exported from the package).
import type { ReactNode } from "react";

import styles from "./docs.module.css";
import { describe, type ThemeId, type Token } from "./tokens.ts";

export const THEME_IDS = ["light", "dark"] as const satisfies readonly ThemeId[];

/** A token as a CSS custom property reference. */
export const cssVar = (name: string) => `var(--ab-${name})`;

/** A page section: a heading, an optional lead paragraph and its content. */
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

/** The authored value of a token as text, per Theme and per media override. */
export function TokenValue({ token }: { token: Token }) {
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

/** A table of tokens: an optional preview, the CSS name, the value and the usage text. */
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

/** Renders its content once per Theme, each inside its own `data-theme` subtree. */
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

/** A filled square in one color token (decorative: the table row names it). */
export function Chip({ name }: { name: string }) {
  return (
    <span aria-hidden="true" className={styles["swatch"]} style={{ "--swatch": cssVar(name) }} />
  );
}

/** A filled square in one color token, drawn in each Theme (decorative: the row names it). */
export function Swatch({ name }: { name: string }) {
  return (
    <InEachTheme>
      <Chip name={name} />
    </InEachTheme>
  );
}

/** A plain list of brand book statements. */
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
