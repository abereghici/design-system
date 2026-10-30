import { useSyncExternalStore } from "react";
import type { ComponentProps } from "react";
import {
  DocsContainer as BaseDocsContainer,
  Controls,
  Description,
  Primary,
  Stories,
  Subtitle,
  Title,
} from "@storybook/addon-docs/blocks";
import { GLOBALS_UPDATED, SET_GLOBALS } from "storybook/internal/core-events";
import { addons } from "storybook/preview-api";

import type { DocsContainerProps } from "@storybook/addon-docs/blocks";
import type { Globals } from "storybook/internal/types";

import { Heading } from "@platform/ui/heading";

import { themes as storybookThemes } from "./theme.ts";

export const themes = ["system", "light", "dark"] as const;

export const directions = ["ltr", "rtl"] as const;

export const locales = ["en-US", "ro-RO", "th-TH"] as const;

/** The Locale global, given to UIProvider as an app passes its `<html lang>`. */
export const localeOf = (globals: Globals) =>
  locales.find((value) => value === globals["locale"]) ?? "en-US";

const prefersDark = matchMedia("(prefers-color-scheme: dark)");
const listeners = new Set<() => void>();
let theme: (typeof themes)[number] = "system";

/** Applies the Theme, Direction and Locale globals to `<html>`, for the canvas and every docs page. */
export function applyGlobals(globals: Globals) {
  theme = themes.find((value) => value === globals["theme"]) ?? "system";

  const root = document.documentElement;

  if (theme === "system") delete root.dataset["theme"];
  else root.dataset["theme"] = theme;

  root.dir = directions.find((value) => value === globals["dir"]) ?? "ltr";
  root.lang = localeOf(globals);

  for (const listener of listeners) listener();
}

const follow = ({ globals }: { globals: Globals }) => {
  applyGlobals(globals);
};

addons.getChannel().on(SET_GLOBALS, follow);
addons.getChannel().on(GLOBALS_UPDATED, follow);

function subscribe(listener: () => void) {
  listeners.add(listener);
  prefersDark.addEventListener("change", listener);

  return () => {
    listeners.delete(listener);
    prefersDark.removeEventListener("change", listener);
  };
}

const scheme = () => (theme === "system" ? (prefersDark.matches ? "dark" : "light") : theme);

export function DocsContainer(props: DocsContainerProps) {
  return (
    <BaseDocsContainer
      {...props}
      theme={storybookThemes[useSyncExternalStore(subscribe, scheme)]}
    />
  );
}

const heading = (as: "h1" | "h2" | "h3") =>
  function DocsHeading({ className, ...props }: ComponentProps<"h1">) {
    return <Heading {...props} as={as} className={`sb-unstyled ${className ?? ""}`} />;
  };

/** MDX headings in the serif heading type; `sb-unstyled` keeps the Storybook prose CSS off them. */
export const mdx = { components: { h1: heading("h1"), h2: heading("h2"), h3: heading("h3") } };

/**
 * Storybook's default page, except that Stories leaves out the primary story: the default counts
 * `.test()` proofs as stories, so it would repeat Default on a page with one story.
 */
export function DocsPage() {
  return (
    <>
      <Title />
      <Subtitle />
      <Description />
      <Primary />
      <Controls />
      <Stories includePrimary={false} />
    </>
  );
}
