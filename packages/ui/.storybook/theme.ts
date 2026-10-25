import { create } from "storybook/theming";

import tokens from "@platform/tokens/tokens.json";

type Scheme = "light" | "dark";

const colors = new Map(tokens.color.tokens.map(({ name, value }) => [name, value]));
const radius = Number(
  tokens.radius.tokens.find(({ name }) => name === "ab-radius-md")?.value.replace("px", ""),
);

// Literals, not light-dark(): Storybook passes theme colors through polished, which throws on
// anything else, and its layout root pins `color-scheme: light dark` to the OS preference.
function theme(scheme: Scheme) {
  const color = (name: string) => {
    const value = colors.get(`ab-${name}`);

    if (value === undefined) throw new Error(`No color token ab-${name}`);

    return typeof value === "string" ? value : value[scheme];
  };

  return create({
    base: scheme,
    colorPrimary: color("color-background-accent-bold"),
    // Storybook draws the selected item as white on darken(0.18, colorSecondary); in dark only Sage 400
    // keeps that at 4.5:1 and the row at 3:1 against the sidebar.
    colorSecondary: color(scheme === "dark" ? "palette-sage-400" : "color-background-accent-bold"),
    appBg: color("color-surface-raised"),
    appContentBg: color("color-surface-default"),
    appPreviewBg: color("color-surface-default"),
    appHoverBg: color("color-background-neutral-subtle-hovered"),
    appBorderColor: color("color-border-subtle"),
    appBorderRadius: radius,
    fontBase: tokens.type.families.figtree,
    fontCode: tokens.type.families["system-mono"],
    textColor: color("color-text-default"),
    textInverseColor: color("color-text-inverse"),
    textMutedColor: color("color-text-subtle"),
    barTextColor: color("color-text-subtle"),
    barHoverColor: color("color-text-accent"),
    barSelectedColor: color("color-text-accent"),
    barBg: color("color-surface-default"),
    buttonBg: color("color-surface-default"),
    buttonBorder: color("color-border-default"),
    booleanBg: color("color-background-neutral-subtle"),
    booleanSelectedBg: color("color-surface-default"),
    inputBg: color("color-surface-default"),
    inputBorder: color("color-border-default"),
    inputTextColor: color("color-text-default"),
    inputBorderRadius: radius,
    brandUrl: "./",
    brandTarget: "_self",
    // Without brandImage, Storybook renders brandTitle as HTML, so the Logo can sit beside the name.
    brandTitle: `<img src="./logo-${scheme === "dark" ? "lichen" : "moss"}.svg" alt="" width="20" height="20" style="vertical-align: middle; margin-inline-end: 8px">Bereghici Design System`,
  });
}

export const themes = { light: theme("light"), dark: theme("dark") };
