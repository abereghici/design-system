import { CONTRAST_BACKGROUNDS, CONTRAST_PAIRS } from "@abereghici/tokens/contrast-matrix";
import { Table } from "@abereghici/ui/table";

import { findToken, resolve, semantic, shown, tokens } from "./tokens.ts";
import type { Token } from "./tokens.ts";
import mdx from "../mdx.module.css";
import styles from "./specimens.module.css";

const token = (name: string): Token => {
  const found = findToken(`ab-${name}`);

  if (found === undefined) throw new Error(`No token ab-${name}`);

  return found;
};

/** A token's value, under a media query when `when` is given. */
export function Value({ of, when }: { of: string; when?: string }) {
  const found = token(of);

  if (when === undefined) return shown(found.light);

  const value = found.conditions.find(({ query }) => query === when)?.value;

  if (value === undefined) throw new Error(`ab-${of} does not change under ${when}`);

  return shown(resolve(value, "light"));
}

/** The first family of a font stack token. */
export function Typeface({ of }: { of: string }) {
  return token(of).light.split(",")[0];
}

/** The tokens a media query changes, as short names. */
export function Changes({ when }: { when: string }) {
  const changed = tokens.filter(({ conditions }) => conditions.some(({ query }) => query === when));

  if (changed.length === 0) throw new Error(`No token changes under ${when}`);

  return (
    <>
      {changed.map(({ name }, index) => (
        <span key={name}>
          {index > 0 && ", "}
          <code>{name.replace(/^ab-(color-)?/v, "")}</code>
        </span>
      ))}
    </>
  );
}

/** Each matching semantic token with its value and what it is for, from the token source. */
export function TokenRows({ match }: { match: string }) {
  const rows = semantic(new RegExp(match, "v"));

  if (rows.length === 0) throw new Error(`No token matches ${match}`);

  return (
    <Table.Root className={`sb-unstyled ${mdx["table"]}`}>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Token</Table.ColumnHeader>
          <Table.ColumnHeader>Value</Table.ColumnHeader>
          <Table.ColumnHeader>Use for</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {rows.map((row) => (
          <Table.Row key={row.name}>
            <Table.RowHeader>
              <code>{row.name.replace(/^ab-/v, "")}</code>
            </Table.RowHeader>
            <Table.Cell>
              {row.themed ? `${shown(row.light)} / ${shown(row.dark)}` : shown(row.light)}
            </Table.Cell>
            <Table.Cell>{row.description}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

const Codes = ({ names }: { names: readonly string[] }) => (
  <span className={styles["codes"]}>
    {names.map((name) => (
      <code key={name}>{name}</code>
    ))}
  </span>
);

/** What may sit on each fill, from the pairs the token build checks for contrast. */
export function FillPairs() {
  const foregrounds = Map.groupBy(CONTRAST_PAIRS, ([, background]) => background);
  const rows = Map.groupBy(foregrounds, ([, pairs]) =>
    pairs.map(([foreground]) => foreground).join(" "),
  );

  return (
    <Table.Root className={`sb-unstyled ${mdx["table"]}`}>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>On these fills</Table.ColumnHeader>
          <Table.ColumnHeader>Use</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.RowHeader>
            <Codes names={CONTRAST_BACKGROUNDS} />
          </Table.RowHeader>
          <Table.Cell>Any text, icon or border role, except disabled and border-subtle</Table.Cell>
        </Table.Row>
        {[...rows].map(([key, fills]) => (
          <Table.Row key={key}>
            <Table.RowHeader>
              <Codes names={fills.map(([background]) => background)} />
            </Table.RowHeader>
            <Table.Cell>
              <Codes names={key.split(" ")} />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
