import { useSyncExternalStore } from "react";
import type { ComponentProps } from "react";
import {
  DocsContainer as BaseDocsContainer,
  Controls,
  Description,
  Primary,
  Source,
  Stories,
  Subtitle,
  Title,
  useOf,
} from "@storybook/addon-docs/blocks";
import { GLOBALS_UPDATED, SET_GLOBALS } from "storybook/internal/core-events";
import { addons } from "storybook/preview-api";

import type { DocsContainerProps } from "@storybook/addon-docs/blocks";
import type { Globals } from "storybook/internal/types";

import { Heading } from "@abereghici/ui/heading";
import { Table } from "@abereghici/ui/table";

import { themes as storybookThemes } from "./theme.ts";
import styles from "./docs/mdx.module.css";

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

/** The Theme the docs pages show, resolving System to the operating system's preference. */
export const useScheme = () => useSyncExternalStore(subscribe, scheme);

export function DocsContainer(props: DocsContainerProps) {
  return <BaseDocsContainer {...props} theme={storybookThemes[useScheme()]} />;
}

const heading = (as: "h1" | "h2" | "h3") =>
  function DocsHeading({ className, ...props }: ComponentProps<"h1">) {
    return (
      <Heading {...props} as={as} className={`sb-unstyled ${styles[as]} ${className ?? ""}`} />
    );
  };

/**
 * MDX headings in the serif heading type and Markdown tables as the Table component; `sb-unstyled`
 * keeps the Storybook prose CSS off them.
 */
export const mdx = {
  components: {
    h1: heading("h1"),
    h2: heading("h2"),
    h3: heading("h3"),
    table: ({ className, ...props }: ComponentProps<"table">) => (
      <Table.Root {...props} className={`sb-unstyled ${styles["table"]} ${className ?? ""}`} />
    ),
    thead: Table.Header,
    tbody: Table.Body,
    tr: Table.Row,
    th: Table.ColumnHeader,
    td: Table.Cell,
  },
};

/**
 * Storybook's default page, except that Stories leaves out the primary story: the default counts
 * `.test()` proofs as stories, so it would repeat Default on a page with one story.
 */
/** The import for the page's component, from its title, or `parameters.import` where that differs. */
function Import() {
  const { preparedMeta } = useOf("meta", ["meta"]);
  const name = preparedMeta.title.split("/").at(-1) ?? "";
  const custom: unknown = preparedMeta.parameters["import"];
  const path = name.replaceAll(/(?<=[a-z])(?=[A-Z])/gv, "-").toLowerCase();

  return (
    <Source
      language="tsx"
      dark={useScheme() === "dark"}
      code={
        typeof custom === "string" ? custom : `import { ${name} } from "@abereghici/ui/${path}";`
      }
    />
  );
}

export function DocsPage() {
  return (
    <>
      <Title />
      <Subtitle />
      <Description />
      <Import />
      <Primary />
      <Controls />
      <Stories includePrimary={false} />
    </>
  );
}
