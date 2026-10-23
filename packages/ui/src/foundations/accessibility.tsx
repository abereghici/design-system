import {
  CONTRAST_BACKGROUNDS,
  CONTRAST_NON_TEXT,
  CONTRAST_NON_TEXT_PAIRS,
  CONTRAST_PAIRS,
  CONTRAST_TEXT,
  contrastRatio,
} from "@platform/tokens/contrast-matrix";

import styles from "./accessibility.module.css";
import { cssVar, Rules, Section, THEME_IDS, TokenTable } from "./docs.tsx";
import { hexIn, token, tokens, type ThemeId, type Token } from "./tokens.ts";

const color = (name: string) => token("semantic", `color-${name}`);

/** The ratio of a pair in a Theme, as the source validator computes it. */
const ratioIn = (foreground: string, background: string, theme: ThemeId) =>
  contrastRatio(hexIn(color(foreground), theme), hexIn(color(background), theme));

interface PairProps {
  foreground: string;
  background: string;
  minimum: number;
  theme: ThemeId;
}

function Ratio({ foreground, background, minimum, theme }: PairProps) {
  // Pass or fail on the exact ratio; two decimals as the build check reports them.
  const ratio = ratioIn(foreground, background, theme);
  return ratio < minimum ? `${ratio.toFixed(2)}:1 below ${minimum}:1` : `${ratio.toFixed(2)}:1`;
}

function Cell({ foreground, background, minimum, theme, text }: PairProps & { text: boolean }) {
  return (
    <td
      data-background={background}
      className={styles["cell"]}
      // Text roles are drawn in their own color, so axe checks the same pair; icons and borders
      // draw a sample bar next to text in the default text color.
      style={{
        "--cell-background": cssVar(`color-${background}`),
        "--cell-sample": cssVar(`color-${foreground}`),
        "--cell-text": cssVar(text ? `color-${foreground}` : "color-text-default"),
      }}
    >
      <Ratio foreground={foreground} background={background} minimum={minimum} theme={theme} />
    </td>
  );
}

function Grid({
  caption,
  roles,
  minimum,
  theme,
  text,
}: {
  caption: string;
  roles: readonly string[];
  minimum: number;
  theme: ThemeId;
  text: boolean;
}) {
  return (
    <table className={styles["matrix"]}>
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Role</th>
          {CONTRAST_BACKGROUNDS.map((background) => (
            <th key={background} scope="col">
              <code>{background}</code>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {roles.map((foreground) => (
          <tr key={foreground}>
            <th scope="row">
              <code>{foreground}</code>
            </th>
            {CONTRAST_BACKGROUNDS.map((background) => (
              <Cell
                key={background}
                foreground={foreground}
                background={background}
                minimum={minimum}
                theme={theme}
                text={text}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Text on fills at 4.5:1, and (ticket #15) status icons on their subtle fills at 3:1.
const FILL_PAIRS = [
  ...CONTRAST_PAIRS.map(([foreground, background]) => ({ foreground, background, minimum: 4.5 })),
  ...CONTRAST_NON_TEXT_PAIRS.map(([foreground, background]) => ({
    foreground,
    background,
    minimum: 3,
  })),
];

function Pairs({ theme }: { theme: ThemeId }) {
  return (
    <table className={styles["matrix"]}>
      <caption>Content on fills · text 4.5:1, icons 3:1</caption>
      <thead>
        <tr>
          <th scope="col">Content</th>
          <th scope="col">Fill</th>
          <th scope="col">Ratio</th>
        </tr>
      </thead>
      <tbody>
        {FILL_PAIRS.map(({ foreground, background, minimum }) => (
          <tr key={`${foreground} ${background}`}>
            <th scope="row">
              <code>{foreground}</code>
            </th>
            <td>
              <code>{background}</code>
            </td>
            <Cell
              foreground={foreground}
              background={background}
              minimum={minimum}
              theme={theme}
              text={minimum === 4.5}
            />
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** The AA contrast matrix, computed from the token source in both Themes. */
export function ContrastMatrix() {
  return (
    <>
      <Section
        title="Contrast"
        lead="Every text, icon and border role meets WCAG 2.2 AA on every background it is allowed on, in every theme. The build fails on any pair below its minimum; these tables are computed from the same token source and matrix."
      >
        <Rules
          items={[
            ["Text · 1.4.3", "4.5:1 on every surface and background it may sit on."],
            ["Non-text · 1.4.11", "Icons and borders need 3:1."],
            [
              "On a fill",
              "on-{role} content on its bold fill, and status text on subtle fills: 4.5:1.",
            ],
            [
              "Exempt",
              "The subtle hairline border is decorative and is never the only boundary of a control. Disabled roles are exempt; pair them with aria-disabled and an explanation.",
            ],
          ]}
        />
      </Section>
      {THEME_IDS.map((theme) => (
        <section
          key={theme}
          data-theme={theme}
          aria-label={`${theme === "light" ? "Light" : "Dark"} Theme`}
          className={styles["theme"]}
        >
          <h3 className={styles["themeHeading"]}>{theme === "light" ? "Light" : "Dark"} Theme</h3>
          <Grid caption="Text · 4.5:1" roles={CONTRAST_TEXT} minimum={4.5} theme={theme} text />
          <Grid
            caption="Icons and borders · 3:1"
            roles={CONTRAST_NON_TEXT}
            minimum={3}
            theme={theme}
            text={false}
          />
          <Pairs theme={theme} />
        </section>
      ))}
    </>
  );
}

const targetPreview = (row: Token) =>
  row.name.startsWith("size-target") ? (
    <span className={styles["target"]} style={{ "--target": cssVar(row.name) }} />
  ) : null;

/** Focus ring and target size (WCAG 2.4.7, 2.4.11, 2.5.8). */
export function FocusAndTarget() {
  return (
    <Section
      title="Focus and target size"
      lead="Focus is always visible, never obscured, never suppressed. Sticky elements must not cover a focused control. Targets are at least 24 × 24 CSS px; buttons and inputs use 44."
    >
      <TokenTable
        caption="Focus and targets"
        rows={tokens("semantic", /^(?:focus-ring-|size-target-)/v)}
        preview={targetPreview}
      />
    </Section>
  );
}
