import type { ReactNode } from "react";
import { NAVIGATE_URL } from "storybook/internal/core-events";
import { addons } from "storybook/preview-api";

import { Table } from "@abereghici/ui/table";

import { findToken, resolve, tokens } from "./tokens.ts";
import type { Token } from "./tokens.ts";
import styles from "./specimens.module.css";

const semantic = (pattern: RegExp) =>
  tokens.filter(({ tier, name }) => tier === "semantic" && pattern.test(name));

const px = (value: string) => {
  if (value.startsWith("clamp(")) return "fluid";

  return value.endsWith("rem") ? `${Number(value.replace("rem", "")) * 16}px` : value;
};

function Label({ token, children }: { token: Token; children?: ReactNode }) {
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
        const size = resolve(`var(--${token.name}-font-size)`, "light");
        const leading = resolve(`var(--${token.name}-line-height)`, "light");

        return (
          <li key={token.name} className={styles["type"]}>
            <span
              className={styles["sample"]}
              style={{
                font: `var(--${token.name})`,
                letterSpacing: `var(--${token.name}-letter-spacing)`,
                textTransform: token.name.includes("overline") ? "uppercase" : undefined,
              }}
            >
              {token.name.includes("code")
                ? "const moss = 263316;"
                : "Moss grows on the north side"}
            </span>
            <Label token={token}>
              <span>
                {px(size)} / {leading}
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
    <Table.Root className={`sb-unstyled ${styles["matrix"]}`}>
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
                      {px(resolve(token.value, "light"))}
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
            <span>{px(resolve(token.value, "light"))}</span>
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

/** What to do and what to avoid, side by side; write a Markdown list inside each. */
export function Guidance({ children }: { children: ReactNode }) {
  return <div className={styles["guidance"]}>{children}</div>;
}

export function Do({ children }: { children: ReactNode }) {
  return (
    <div className={styles["do"]}>
      <p className={styles["verdict"]}>Do</p>
      {children}
    </div>
  );
}

export function Dont({ children }: { children: ReactNode }) {
  return (
    <div className={styles["dont"]}>
      <p className={styles["verdict"]}>Don’t</p>
      {children}
    </div>
  );
}

interface LinkCard {
  readonly title: string;
  readonly href: string;
  readonly children: ReactNode;
}

/** A grid of links to other pages, given as `?path=…`, each with a line on what is there. */
export function LinkCards({ links }: { links: readonly LinkCard[] }) {
  return (
    <ul className={`sb-unstyled ${styles["cards"]}`}>
      {links.map(({ title, href, children }) => (
        <li key={href}>
          <a
            href={`./${href}`}
            target="_top"
            className={styles["link"]}
            onClick={(event) => {
              if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;

              event.preventDefault();
              addons.getChannel().emit(NAVIGATE_URL, href);
            }}
          >
            <strong>{title}</strong>
            <span>{children}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
