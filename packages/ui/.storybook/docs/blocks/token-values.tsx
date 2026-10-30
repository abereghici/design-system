import type { CSSProperties } from "react";

import { themes } from "./tokens.ts";
import type { Scheme, Token } from "./tokens.ts";
import styles from "./token-explorer.module.css";

export type Inspect = (token: Token) => void;

const samples: Partial<Record<string, (value: string) => CSSProperties>> = {
  color: (value) => ({ backgroundColor: value }),
  shadow: (value) => ({ boxShadow: value }),
  typography: (value) => ({ font: value }),
  fontFamily: (value) => ({ fontFamily: value }),
  dimension: (value) => ({ inlineSize: `min(${value}, 100%)` }),
  radius: (value) => ({ borderRadius: value }),
  "letter-spacing": (value) => ({ letterSpacing: value }),
};

/** A sample of the value, for the types of token that have a visible one. */
const previewOf = ({ name, type }: Token, value: string) =>
  samples[/radius|letter-spacing/v.exec(name)?.[0] ?? type]?.(value);

/** A preview in the page's Theme, or in the given one for a themed token. */
function Preview({ token, scheme }: { token: Token; scheme?: Scheme }) {
  const style = previewOf(token, token[scheme ?? "light"]);

  if (style === undefined) return null;

  const text = "font" in style || "fontFamily" in style || "letterSpacing" in style;

  return (
    <span data-theme={scheme} className={styles["frame"]}>
      <span aria-hidden="true" className={text ? styles["glyph"] : styles["sample"]} style={style}>
        {text && "Ag"}
      </span>
    </span>
  );
}

export function Previews({ token }: { token: Token }) {
  return (
    <span className={styles["previews"]}>
      {token.themed ? (
        themes.map(({ id }) => <Preview key={id} token={token} scheme={id} />)
      ) : (
        <Preview token={token} />
      )}
    </span>
  );
}

export function Values({ token }: { token: Token }) {
  if (!token.themed) return <code className={styles["value"]}>{token.light}</code>;

  return (
    <dl className={styles["values"]}>
      {themes.map(({ id, name }) => (
        <div key={id}>
          <dt>{name}</dt>
          <dd>
            <code className={styles["value"]}>{token[id]}</code>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function TokenLink({ token, onInspect }: { token: Token; onInspect: Inspect }) {
  return (
    <button
      type="button"
      className={styles["name"]}
      onClick={() => {
        onInspect(token);
      }}
    >
      --{token.name}
    </button>
  );
}
