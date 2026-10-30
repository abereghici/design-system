import { useState } from "react";

import {
  CONTRAST_BACKGROUNDS,
  CONTRAST_NON_TEXT,
  CONTRAST_PAIRS,
  CONTRAST_TEXT,
  contrastRatio,
} from "@abereghici/tokens/contrast-matrix";
import { CheckIcon } from "@abereghici/ui/icons/check";
import { SegmentedControl } from "@abereghici/ui/segmented-control";

import { findToken, resolve } from "./tokens.ts";
import type { Scheme } from "./tokens.ts";
import styles from "./contrast-grid.module.css";

const hex = (name: string, scheme: Scheme) =>
  resolve(findToken(`ab-color-${name}`)?.value ?? "", scheme);

const ratio = (foreground: string, background: string, scheme: Scheme) =>
  contrastRatio(hex(foreground, scheme), hex(background, scheme));

const short = (name: string) =>
  name.replace(/^(surface|background|text|icon|border)-/v, "").replace("neutral-subtle-", "");

/** A text, icon or border sample in the foreground's own color. */
function Sample({ foreground }: { foreground: string }) {
  const color = `var(--ab-color-${foreground})`;

  if (foreground.startsWith("icon-")) return <CheckIcon size="md" style={{ color }} />;

  if (foreground.startsWith("border-"))
    return <span className={styles["edge"]} style={{ borderColor: color }} />;

  return (
    <span className={styles["text"]} style={{ color }}>
      Aa
    </span>
  );
}

function Cell({ foreground, background, minimum, scheme }: Pair & { scheme: Scheme }) {
  const value = ratio(foreground, background, scheme);

  return (
    <div
      className={styles["cell"]}
      style={{ backgroundColor: `var(--ab-color-${background})` }}
      data-fails={value < minimum || undefined}
    >
      <Sample foreground={foreground} />
      <span
        className={styles["ratio"]}
        style={
          foreground.startsWith("text-") ? { color: `var(--ab-color-${foreground})` } : undefined
        }
      >
        {value.toFixed(2)}
      </span>
    </div>
  );
}

interface Pair {
  readonly foreground: string;
  readonly background: string;
  readonly minimum: number;
}

function Matrix({
  foregrounds,
  minimum,
  scheme,
}: {
  foregrounds: readonly string[];
  minimum: number;
  scheme: Scheme;
}) {
  return (
    <div className={styles["scroll"]}>
      <table className={styles["matrix"]}>
        <thead>
          <tr>
            <th scope="col">On</th>
            {CONTRAST_BACKGROUNDS.map((background) => (
              <th key={background} scope="col">
                {short(background)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {foregrounds.map((foreground) => (
            <tr key={foreground}>
              <th scope="row">{foreground}</th>
              {CONTRAST_BACKGROUNDS.map((background) => (
                <td key={background}>
                  <Cell
                    foreground={foreground}
                    background={background}
                    minimum={minimum}
                    scheme={scheme}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Every foreground on every background it may sit on, drawn in the tokens' colors with the
 * measured contrast ratio, in the chosen Theme.
 */
export function ContrastGrid() {
  const [scheme, setScheme] = useState<Scheme>("light");

  return (
    <div className={`sb-unstyled ${styles["root"]}`}>
      <SegmentedControl.Root
        aria-label="Theme"
        value={scheme}
        onValueChange={(value) => {
          setScheme(value === "dark" ? "dark" : "light");
        }}
      >
        <SegmentedControl.Item value="light">Light</SegmentedControl.Item>
        <SegmentedControl.Item value="dark">Dark</SegmentedControl.Item>
      </SegmentedControl.Root>
      <div data-theme={scheme} className={styles["theme"]}>
        <h3 className={styles["heading"]}>Text, at least 4.5:1</h3>
        <Matrix foregrounds={CONTRAST_TEXT} minimum={4.5} scheme={scheme} />
        <h3 className={styles["heading"]}>Icons and borders, at least 3:1</h3>
        <Matrix foregrounds={CONTRAST_NON_TEXT} minimum={3} scheme={scheme} />
        <h3 className={styles["heading"]}>Content on fills, at least 4.5:1</h3>
        <ul className={styles["pairs"]}>
          {CONTRAST_PAIRS.map(([foreground, background]) => (
            <li key={`${foreground} ${background}`}>
              <Cell foreground={foreground} background={background} minimum={4.5} scheme={scheme} />
              <span className={styles["pair"]}>
                {foreground}
                <br />
                on {background}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
