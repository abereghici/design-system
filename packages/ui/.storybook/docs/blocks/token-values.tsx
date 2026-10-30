import type { CSSProperties } from "react";

import { isThemed, resolve } from "./tokens.ts";
import type { Scheme, Token } from "./tokens.ts";
import styles from "./token-explorer.module.css";

export const schemes = ["light", "dark"] as const satisfies readonly Scheme[];

export const schemeLabel = (scheme: Scheme) => (scheme === "light" ? "Light" : "Dark");

export type Inspect = (token: Token) => void;

/** A sample of the value, for the kinds of token that have a visible one. */
function previewOf({ name }: Token, value: string): CSSProperties | undefined {
  if (/shadow$|^ab-elevation-/v.test(name)) return { boxShadow: value };

  if (/radius/v.test(name)) return { borderRadius: value };

  if (CSS.supports("color", value) && !/^\d/v.test(value)) return { backgroundColor: value };

  if (/^ab-type-[a-z]+-[a-z0-9]+$|-font$/v.test(name)) return { font: value };

  if (/font-family/v.test(name)) return { fontFamily: value };

  if (/space|dimension|size|gap|padding|width|height/v.test(name) && CSS.supports("width", value))
    return { inlineSize: `min(${value}, 100%)` };

  return undefined;
}

/** A preview in the page's Theme, or in the given one for a themed token. */
function Preview({ token, scheme }: { token: Token; scheme?: Scheme }) {
  const style = previewOf(token, resolve(token.value, scheme ?? "light"));

  if (style === undefined) return null;

  const text = "font" in style || "fontFamily" in style;

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
      {isThemed(token) ? (
        schemes.map((scheme) => <Preview key={scheme} token={token} scheme={scheme} />)
      ) : (
        <Preview token={token} />
      )}
    </span>
  );
}

export function Values({ token }: { token: Token }) {
  if (!isThemed(token))
    return <code className={styles["value"]}>{resolve(token.value, "light")}</code>;

  return (
    <dl className={styles["values"]}>
      {schemes.map((scheme) => (
        <div key={scheme}>
          <dt>{schemeLabel(scheme)}</dt>
          <dd>
            <code className={styles["value"]}>{resolve(token.value, scheme)}</code>
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
