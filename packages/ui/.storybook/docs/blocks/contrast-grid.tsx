import { useState } from "react";

import {
  CONTRAST_BACKGROUNDS,
  CONTRAST_NON_TEXT,
  CONTRAST_REQUIREMENTS,
  CONTRAST_TEXT,
  contrastRatio,
} from "@abereghici/tokens/contrast-matrix";
import { CheckIcon } from "@abereghici/ui/icons/check";
import { SegmentedControl } from "@abereghici/ui/segmented-control";
import type { ContrastRequirement } from "@abereghici/tokens/contrast-matrix";

import { findToken, themes } from "./tokens.ts";
import type { Scheme } from "./tokens.ts";
import styles from "./contrast-grid.module.css";

const hex = (name: string, scheme: Scheme) => findToken(`ab-color-${name}`)?.[scheme] ?? "";

const key = (foreground: string, background: string) => `${foreground} on ${background}`;

const requirements = new Map(
  CONTRAST_REQUIREMENTS.map((requirement) => [
    key(requirement.foreground, requirement.background),
    requirement,
  ]),
);

const inMatrix = new Set(
  [...CONTRAST_TEXT, ...CONTRAST_NON_TEXT].flatMap((foreground) =>
    CONTRAST_BACKGROUNDS.map((background) => key(foreground, background)),
  ),
);

/** The pairs outside the matrix: content on bold fills, and fills on surfaces. */
const pairs = CONTRAST_REQUIREMENTS.filter(
  ({ foreground, background }) => !inMatrix.has(key(foreground, background)),
);

const minimumOf = (foreground: string) =>
  requirements.get(key(foreground, CONTRAST_BACKGROUNDS[0] ?? ""))?.minimum;

const short = (name: string) =>
  name.replace(/^(surface|background|text|icon|border)-/v, "").replace("neutral-subtle-", "");

/** A sample of the foreground in the cell's color: text, an icon, an edge or a fill. */
function Sample({ foreground }: { foreground: string }) {
  if (foreground.startsWith("text-")) return <span className={styles["text"]}>Aa</span>;

  if (foreground.startsWith("icon-")) return <CheckIcon size="md" />;

  return <span className={foreground.startsWith("border-") ? styles["edge"] : styles["fill"]} />;
}

function Cell({
  requirement: { foreground, background },
  scheme,
}: {
  requirement: ContrastRequirement;
  scheme: Scheme;
}) {
  return (
    <div
      className={styles["cell"]}
      style={{
        color: `var(--ab-color-${foreground})`,
        backgroundColor: `var(--ab-color-${background})`,
      }}
    >
      <Sample foreground={foreground} />
      <span className={styles["ratio"]}>
        {contrastRatio(hex(foreground, scheme), hex(background, scheme)).toFixed(2)}
      </span>
    </div>
  );
}

function Matrix({ foregrounds, scheme }: { foregrounds: readonly string[]; scheme: Scheme }) {
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
              {CONTRAST_BACKGROUNDS.map((background) => {
                const requirement = requirements.get(key(foreground, background));

                return (
                  <td key={background}>
                    {requirement && <Cell requirement={requirement} scheme={scheme} />}
                  </td>
                );
              })}
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
          setScheme(themes.find(({ id }) => id === value)?.id ?? "light");
        }}
      >
        {themes.map(({ id, name }) => (
          <SegmentedControl.Item key={id} value={id}>
            {name}
          </SegmentedControl.Item>
        ))}
      </SegmentedControl.Root>
      <div data-theme={scheme} className={styles["theme"]}>
        <h3 className={styles["heading"]}>Text, at least {minimumOf(CONTRAST_TEXT[0] ?? "")}:1</h3>
        <Matrix foregrounds={CONTRAST_TEXT} scheme={scheme} />
        <h3 className={styles["heading"]}>
          Icons and borders, at least {minimumOf(CONTRAST_NON_TEXT[0] ?? "")}:1
        </h3>
        <Matrix foregrounds={CONTRAST_NON_TEXT} scheme={scheme} />
        <h3 className={styles["heading"]}>Content on fills, and fills on surfaces</h3>
        <ul className={styles["pairs"]}>
          {pairs.map((requirement) => (
            <li key={key(requirement.foreground, requirement.background)}>
              <Cell requirement={requirement} scheme={scheme} />
              <span className={styles["pair"]}>
                {requirement.foreground}
                <br />
                on {requirement.background}, at least {requirement.minimum}:1
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
