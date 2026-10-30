import type { ReactNode } from "react";

import { Button } from "@abereghici/ui/button";
import { Sheet } from "@abereghici/ui/sheet";

import { CopyButton } from "./copy-button.tsx";
import { Previews, schemeLabel, schemes, TokenLink, Values } from "./token-values.tsx";
import type { Inspect } from "./token-values.tsx";
import { chain, isThemed, usedBy } from "./tokens.ts";
import type { Token } from "./tokens.ts";
import styles from "./token-explorer.module.css";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <h3 className={styles["heading"]}>{title}</h3>
      {children}
    </>
  );
}

/** The aliases a token passes through, per Theme when they differ. */
function Chain({ token, onInspect }: { token: Token; onInspect: Inspect }) {
  const themed = isThemed(token);
  const paths = (themed ? schemes : (["light"] as const)).map(
    (scheme) => [scheme, chain(token, scheme)] as const,
  );

  if (paths.every(([, path]) => path.length === 0)) return null;

  return (
    <Section title="Resolves through">
      {paths.map(([scheme, path]) => (
        <ol key={scheme} className={styles["chain"]}>
          {themed && <li className={styles["scheme"]}>{schemeLabel(scheme)}</li>}
          {path.map((step) => (
            <li key={step.name}>
              <TokenLink token={step} onInspect={onInspect} />
            </li>
          ))}
        </ol>
      ))}
    </Section>
  );
}

function Conditions({ token }: { token: Token }) {
  if (token.conditions.length === 0) return null;

  return (
    <Section title="Changes when">
      <dl className={styles["conditions"]}>
        {token.conditions.map(({ when, value }) => (
          <div key={when}>
            <dt>
              <code>{when}</code>
            </dt>
            <dd>
              <code>{value}</code>
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

function Dependents({ token, onInspect }: { token: Token; onInspect: Inspect }) {
  const dependents = usedBy(token);

  return (
    <Section title={`Used by ${dependents.length}`}>
      {dependents.length > 0 && (
        <ul className={styles["dependents"]}>
          {dependents.map((dependent) => (
            <li key={dependent.name}>
              <TokenLink token={dependent} onInspect={onInspect} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

/** Everything about one token: its values, aliases, conditions and dependents. */
export function Inspector({ token, onInspect }: { token: Token; onInspect: Inspect }) {
  return (
    <>
      <Sheet.Title>
        <code>--{token.name}</code>
      </Sheet.Title>
      {token.description !== "" && <Sheet.Description>{token.description}</Sheet.Description>}
      <Sheet.Body>
        <Previews token={token} />
        <Section title="Value">
          <Values token={token} />
        </Section>
        <Chain token={token} onInspect={onInspect} />
        <Conditions token={token} />
        <Dependents token={token} onInspect={onInspect} />
      </Sheet.Body>
      <Sheet.Footer>
        <CopyButton text={`var(--${token.name})`}>Copy var()</CopyButton>
        <Sheet.Close asChild>
          <Button variant="primary">Done</Button>
        </Sheet.Close>
      </Sheet.Footer>
      <Sheet.Close aria-label="Close" />
    </>
  );
}
