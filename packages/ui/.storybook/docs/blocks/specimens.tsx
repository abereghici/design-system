import type { ReactNode } from "react";

import { Table } from "@abereghici/ui/table";

import { Previews } from "./token-values.tsx";
import { chain, findToken, semantic, shown, themes } from "./tokens.ts";
import type { Token } from "./tokens.ts";
import mdx from "../mdx.module.css";
import styles from "./specimens.module.css";

function Label({ token, children }: { token: Token; children: ReactNode }) {
  return (
    <span className={styles["label"]}>
      <code>--{token.name}</code>
      {children}
    </span>
  );
}

/** Each type role set in its own style, with its size and line height. */
export function TypeScale() {
  return (
    <ul className={`sb-unstyled ${styles["list"]}`}>
      {semantic(/^ab-type-[a-z]+-[a-z0-9]+$/v).map((token) => {
        const size = findToken(`${token.name}-font-size`)?.light ?? "";
        const leading = findToken(`${token.name}-line-height`)?.light;

        return (
          <li key={token.name} className={styles["type"]}>
            <span
              className={styles["sample"]}
              style={{
                font: `var(--${token.name})`,
                letterSpacing: `var(--${token.name}-letter-spacing)`,
                textTransform: `var(--${token.name}-text-transform)`,
              }}
            >
              {token.name.includes("code")
                ? "const moss = 263316;"
                : "Moss grows on the north side"}
            </span>
            <Label token={token}>
              <span>
                {shown(size)} / {leading}
              </span>
              <span>{token.description}</span>
            </Label>
          </li>
        );
      })}
    </ul>
  );
}

const spaceKinds = ["inline", "inset", "stack"] as const;

const spaceSizes = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"] as const;

/** The inline, inset and stack sizes side by side, each with a square of its own size. */
export function SpaceScale() {
  const rows = spaceSizes.filter((size) =>
    spaceKinds.some((kind) => findToken(`ab-space-${kind}-${size}`)),
  );

  return (
    <Table.Root className={`sb-unstyled ${mdx["table"]}`}>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Size</Table.ColumnHeader>
          {spaceKinds.map((kind) => (
            <Table.ColumnHeader key={kind}>
              <code>{kind}</code>
            </Table.ColumnHeader>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {rows.map((size) => (
          <Table.Row key={size}>
            <Table.RowHeader>
              <code>{size}</code>
            </Table.RowHeader>
            {spaceKinds.map((kind) => {
              const token = findToken(`ab-space-${kind}-${size}`);

              return (
                <Table.Cell key={kind}>
                  {token && (
                    <span className={styles["space"]}>
                      <span
                        aria-hidden="true"
                        className={styles["square"]}
                        style={{
                          inlineSize: `var(--${token.name})`,
                          blockSize: `var(--${token.name})`,
                        }}
                      />
                      {shown(token.light)}
                    </span>
                  )}
                </Table.Cell>
              );
            })}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

/** The radius tokens on a square each. */
export function RadiusScale() {
  return (
    <ul className={`sb-unstyled ${styles["tiles"]}`}>
      {semantic(/^ab-radius-/v).map((token) => (
        <li key={token.name} className={styles["tile"]}>
          <span
            aria-hidden="true"
            className={styles["corner"]}
            style={{ borderRadius: `var(--${token.name})` }}
          />
          <Label token={token}>
            <span>{shown(token.light)}</span>
          </Label>
        </li>
      ))}
    </ul>
  );
}

/** A card at each Elevation, with what it is for. */
export function ElevationScale() {
  return (
    <ul className={`sb-unstyled ${styles["tiles"]}`}>
      {semantic(/^ab-elevation-(raised|overlay|toast|modal)$/v).map((token) => (
        <li key={token.name} className={styles["tile"]}>
          <span
            aria-hidden="true"
            className={styles["card"]}
            style={{ boxShadow: `var(--${token.name})` }}
          />
          <Label token={token}>
            <span>{token.description}</span>
          </Label>
        </li>
      ))}
    </ul>
  );
}

const layer = (name: string, children?: ReactNode) => (
  <div className={styles["surface"]} style={{ backgroundColor: `var(--ab-color-surface-${name})` }}>
    <code>surface-{name}</code>
    {children}
  </div>
);

/** The four surfaces, each inside the one it sits on. */
export function Surfaces() {
  return (
    <div className={`sb-unstyled ${styles["surfaces"]}`}>
      {layer("default", layer("raised", layer("nested")))}
      <div className={styles["overlay"]}>{layer("overlay")}</div>
    </div>
  );
}

/** One component token traced to the semantic and primitive tokens behind it, in tier order. */
export function TierFlow({ of }: { of: string }) {
  const component = findToken(`ab-${of}`);

  if (component === undefined) throw new Error(`No token ab-${of}`);

  const steps = [
    ["Primitive", [...new Set(themes.map(({ id }) => chain(component, id).at(-1)))]],
    ["Semantic", [chain(component, "light")[0]]],
    ["Component", [component]],
  ] as const;

  return (
    <ol className={`sb-unstyled ${styles["flow"]}`}>
      {steps.map(([tier, members]) => (
        <li key={tier} className={styles["step"]}>
          <span className={styles["tier"]}>{tier}</span>
          {members.map(
            (token) =>
              token && (
                <span key={token.name} className={styles["member"]}>
                  <Previews token={token} />
                  <code>--{token.name}</code>
                </span>
              ),
          )}
        </li>
      ))}
    </ol>
  );
}
