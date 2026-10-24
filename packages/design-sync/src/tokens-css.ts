/** The parts of `@platform/tokens/tokens.json` this file reads. */
export interface TokensJson {
  readonly name: string;
  readonly color: {
    readonly themes: readonly { readonly id: string }[];
    readonly tokens: readonly Entry[];
  };
  readonly type: {
    readonly families: Readonly<Record<string, string>>;
    readonly groups: readonly {
      readonly family: string;
      readonly styles: readonly {
        readonly name: string;
        readonly fontSize: string;
        readonly lineHeight: string;
        readonly fontWeight: number;
        readonly letterSpacing: string;
      }[];
    }[];
  };
  readonly [family: string]: unknown;
}

interface Entry {
  readonly name: string;
  readonly value: string | Readonly<Record<string, string>>;
  readonly usage?: string;
}

interface List {
  readonly key: string;
  readonly tokens: readonly Entry[];
}

const THEMED = new Set(["color", "shadow"]);

const valueIn = (entry: Entry, theme: string, first: string) =>
  typeof entry.value === "string" ? entry.value : (entry.value[theme] ?? entry.value[first] ?? "");

const isEntry = (value: unknown): value is Entry =>
  typeof value === "object" && value !== null && typeof Reflect.get(value, "name") === "string";

const block = (selector: string, lines: readonly string[]) =>
  lines.length === 0 ? "" : `${selector} {\n${lines.map((line) => `  ${line}\n`).join("")}}\n`;

/** Every `{ tokens: [...] }` family but `color` (and `type`, which has no list), in file order. */
function listsOf(tokens: TokensJson): List[] {
  const lists: List[] = [];
  for (const key of Object.keys(tokens)) {
    if (key === "type" || key === "color") continue;
    const family: unknown = tokens[key];
    const entries: unknown =
      typeof family === "object" && family !== null ? Reflect.get(family, "tokens") : undefined;
    if (Array.isArray(entries))
      lists.push({ key, tokens: entries.filter((entry) => isEntry(entry)) });
  }
  return lists;
}

function declarations(lists: readonly List[], theme: string, first: string, onlyThemed = false) {
  const lines: string[] = [];
  for (const { tokens } of lists) {
    for (const entry of tokens) {
      if (onlyThemed && typeof entry.value === "string") continue;
      lines.push(`--${entry.name}: ${valueIn(entry, theme, first)};`);
    }
  }
  return lines;
}

function typeStyles(tokens: TokensJson): string[] {
  const blocks: string[] = [];
  for (const { family, styles } of tokens.type.groups) {
    for (const style of styles) {
      blocks.push(
        block(`.${style.name}`, [
          `font-family: var(--font-${family});`,
          `font-size: ${style.fontSize};`,
          `line-height: ${style.lineHeight};`,
          `font-weight: ${String(style.fontWeight)};`,
          `letter-spacing: ${style.letterSpacing};`,
        ]),
      );
    }
  }
  return blocks;
}

/**
 * The artifact's `tokens.css`, compiled from `tokens.json` as the type's format.md lays it out:
 * "`:root, [data-theme="<first>"] { --<color>; --<shadow> }`, a `[data-theme="<id>"]` block per
 * further theme (overrides + aliases re-declared), `:root { --<space>; --<radius>; --<other>;
 * --font-<key> }`, a `.<style>` class per type style, `@font-face` per font". Line 1 is the
 * marker the type's SKILL.md asks for: "`/* <title> — generated from tokens.json *\/`".
 *
 * A page never saves a system synced from code, so the sync writes this file (craft.md, "One
 * source for every value"). `fontFaces` is `@platform/tokens/fonts.css` with its URLs pointing at
 * `fonts/`, so the faces keep their `unicode-range` subsets.
 */
export function compileTokensCss(tokens: TokensJson, fontFaces: string): string {
  const [first, ...later] = tokens.color.themes.map(({ id }) => id);
  if (first === undefined) throw new Error("tokens.json has no color theme");
  const lists = listsOf(tokens);
  const themed = [
    { key: "color", tokens: tokens.color.tokens },
    ...lists.filter(({ key }) => THEMED.has(key)),
  ];
  const plain = lists.filter(({ key }) => !THEMED.has(key));
  const fonts = Object.keys(tokens.type.families).map(
    (key) => `--font-${key}: ${tokens.type.families[key] ?? ""};`,
  );
  return [
    `/* ${tokens.name} — generated from tokens.json */\n`,
    block(`:root, [data-theme="${first}"]`, declarations(themed, first, first)),
    ...later.map((theme) =>
      block(`[data-theme="${theme}"]`, declarations(themed, theme, first, true)),
    ),
    block(":root", [...declarations(plain, first, first), ...fonts]),
    ...typeStyles(tokens),
    fontFaces,
  ].join("");
}
