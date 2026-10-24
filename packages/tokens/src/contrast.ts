import type { Dictionary } from "style-dictionary/types";

import {
  CONTRAST_REQUIREMENTS,
  contrastRatio,
  type ContrastRequirement,
} from "./contrast-matrix.ts";
import { THEMES, valueIn, type ThemeId } from "./theme.ts";

const OPAQUE_HEX = /^#[0-9a-f]{6}$/iv;

const checkPair = (
  requirement: ContrastRequirement,
  theme: ThemeId,
  dictionary: Dictionary,
): string[] => {
  const { foreground, background, minimum } = requirement;
  const fg = dictionary.tokenMap.get(`{semantic.color-${foreground}}`);
  const bg = dictionary.tokenMap.get(`{semantic.color-${background}}`);
  if (fg === undefined || bg === undefined) {
    // As in the source validator, a pair that can't be resolved is a failure.
    const missing = [fg === undefined ? foreground : [], bg === undefined ? background : []].flat();
    return [
      `[${theme}] --ab-color-${foreground} on --ab-color-${background}: ${missing.map((name) => `--ab-color-${name}`).join(" and ")} ${missing.length > 1 ? "are" : "is"} not defined, so the pair can't be checked`,
    ];
  }
  const label = `[${theme}] --${fg.name} on --${bg.name}`;
  const fgColor = String(valueIn(fg, theme, dictionary));
  const bgColor = String(valueIn(bg, theme, dictionary));
  if (!OPAQUE_HEX.test(fgColor) || !OPAQUE_HEX.test(bgColor)) {
    return [
      `${label}: cannot check contrast of ${fgColor} on ${bgColor} (needs opaque sRGB colors)`,
    ];
  }
  const ratio = contrastRatio(fgColor, bgColor);
  return ratio < minimum ? [`${label}: ${ratio.toFixed(2)}:1, needs ${minimum}:1`] : [];
};

export const checkContrast = (dictionary: Dictionary): string[] =>
  THEMES.flatMap(({ id }) =>
    CONTRAST_REQUIREMENTS.flatMap((requirement) => checkPair(requirement, id, dictionary)),
  );
