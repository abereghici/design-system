import { CONTRAST_BACKGROUNDS, CONTRAST_PAIRS } from "@abereghici/tokens/contrast-matrix";
import { Table } from "@abereghici/ui/table";

import packageJson from "../../../package.json" with { type: "json" };

import { findToken, isThemed, resolve, tokens } from "./tokens.ts";
import type { Token } from "./tokens.ts";
import styles from "./specimens.module.css";

const token = (name: string): Token => {
  const found = findToken(`ab-${name}`);

  if (found === undefined) throw new Error(`No token ab-${name}`);

  return found;
};

const display = (value: string) => {
  if (value.startsWith("clamp(")) return "fluid";

  if (/^[\d.]+s$/v.test(value)) return `${Math.round(Number(value.replace("s", "")) * 1000)}ms`;

  return value.endsWith("rem") ? `${Number(value.replace("rem", "")) * 16}px` : value;
};

/** A token's value, read from the shipped CSS, under a media query when `when` is given. */
export function Value({ of, when }: { of: string; when?: string }) {
  const found = token(of);
  const value =
    when === undefined
      ? found.value
      : found.conditions.find((condition) => condition.when === when)?.value;

  if (value === undefined) throw new Error(`ab-${of} does not change under ${when}`);

  return display(resolve(value, "light"));
}

/** The first family of a font stack token. */
export function Typeface({ of }: { of: string }) {
  return resolve(token(of).value, "light").split(",")[0];
}

/** The tokens a media query changes, as short names. */
export function Changes({ when }: { when: string }) {
  const changed = tokens.filter(({ conditions }) =>
    conditions.some((condition) => condition.when === when),
  );

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
  const pattern = new RegExp(match, "v");
  const rows = tokens.filter(({ tier, name }) => tier === "semantic" && pattern.test(name));

  if (rows.length === 0) throw new Error(`No token matches ${match}`);

  return (
    <Table.Root className={`sb-unstyled ${styles["matrix"]}`}>
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
              {isThemed(row)
                ? `${display(resolve(row.value, "light"))} / ${display(resolve(row.value, "dark"))}`
                : display(resolve(row.value, "light"))}
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
    <Table.Root className={`sb-unstyled ${styles["matrix"]}`}>
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

/** The range of a peer dependency, from the package's own manifest. */
export function Peer({ name }: { name: keyof typeof packageJson.peerDependencies }) {
  return <code>{packageJson.peerDependencies[name]}</code>;
}
