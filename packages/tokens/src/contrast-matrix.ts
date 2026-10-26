export const CONTRAST_BACKGROUNDS = [
  "surface-default",
  "surface-raised",
  "surface-nested",
  "surface-floating",
  "background-neutral-subtle-hovered",
  "background-neutral-subtle-pressed",
  "background-selected",
  "background-accent-subtle",
];

export const CONTRAST_TEXT = [
  "text-default",
  "text-subtle",
  "text-subtlest",
  "text-accent",
  "text-selected",
  "text-success",
  "text-warning",
  "text-danger",
];

export const CONTRAST_NON_TEXT = [
  "icon-default",
  "icon-subtle",
  "icon-subtlest",
  "icon-accent",
  "icon-selected",
  "icon-success",
  "icon-warning",
  "icon-danger",
  "border-default",
  "border-default-hovered",
  "border-accent",
  "border-focused",
  "border-selected",
  "border-success",
  "border-warning",
  "border-danger",
];

export const CONTRAST_PAIRS = [
  ["text-on-accent", "background-accent-bold"],
  ["text-on-accent", "background-accent-bold-hovered"],
  ["text-on-accent", "background-accent-bold-pressed"],
  ["icon-on-accent", "background-accent-bold"],
  ["text-on-success", "background-success-bold"],
  ["text-on-warning", "background-warning-bold"],
  ["text-on-danger", "background-danger-bold"],
  ["text-on-highlight", "background-highlight"],
  ["text-inverse", "background-neutral-bold"],
  ["text-default", "background-success-subtle"],
  ["text-success", "background-success-subtle"],
  ["text-default", "background-warning-subtle"],
  ["text-warning", "background-warning-subtle"],
  ["text-default", "background-danger-subtle"],
  ["text-danger", "background-danger-subtle"],
  ["text-subtle", "background-success-subtle"],
  ["text-subtle", "background-warning-subtle"],
  ["text-subtle", "background-danger-subtle"],
] as const;

export const CONTRAST_NON_TEXT_PAIRS = [
  ["icon-success", "background-success-subtle"],
  ["icon-warning", "background-warning-subtle"],
  ["icon-danger", "background-danger-subtle"],
  ["background-accent-bold", "surface-default"],
  ["background-accent-bold", "surface-raised"],
  ["background-accent-bold", "surface-nested"],
  ["background-accent-bold", "surface-floating"],
  ["surface-floating", "background-accent-bold"],
] as const;

export interface ContrastRequirement {
  readonly foreground: string;
  readonly background: string;
  readonly minimum: number;
}

export const CONTRAST_REQUIREMENTS: readonly ContrastRequirement[] = [
  ...CONTRAST_TEXT.flatMap((foreground) =>
    CONTRAST_BACKGROUNDS.map((background) => ({ foreground, background, minimum: 4.5 })),
  ),
  ...CONTRAST_NON_TEXT.flatMap((foreground) =>
    CONTRAST_BACKGROUNDS.map((background) => ({ foreground, background, minimum: 3 })),
  ),
  ...CONTRAST_PAIRS.map(([foreground, background]) => ({ foreground, background, minimum: 4.5 })),
  ...CONTRAST_NON_TEXT_PAIRS.map(([foreground, background]) => ({
    foreground,
    background,
    minimum: 3,
  })),
];

const luminance = (hex: string): number => {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((i) => {
    const channel = Number.parseInt(hex.slice(i, i + 2), 16) / 255;

    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrastRatio = (a: string, b: string): number => {
  const [darker = 0, lighter = 0] = [luminance(a), luminance(b)].toSorted((x, y) => x - y);

  return (lighter + 0.05) / (darker + 0.05);
};
