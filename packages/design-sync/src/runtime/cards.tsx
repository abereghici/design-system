import "./cards.css";

import { createElement, type ReactNode } from "react";

import type { StubStory } from "./storybook.ts";

/** One preview card: a story file, rendered as every story it exports. */
export interface Card {
  /** The story title's last segment, the card's folder under `components/`. */
  readonly name: string;
  /** The story title's first segment ("<its story title's first segment>", from-code.md step 7). */
  readonly group: string;
  /** True when the namespace has no export of that name: a showcase page, not a component. */
  readonly page: boolean;
  /** Story names, in file order. */
  readonly stories: readonly string[];
  /** The stories themselves, by export name, in file order. */
  readonly entries: readonly (readonly [string, StubStory])[];
}

/** A story file's module, and its export names in source order (a module namespace sorts them). */
export interface StoryFile {
  readonly module: Readonly<Record<string, unknown>>;
  readonly order: readonly string[];
}

/** Storybook's story name from an export name: `DarkRightToLeft` → "Dark Right To Left". */
export const storyName = (exportName: string) =>
  exportName.replaceAll(/(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/gv, " ");

const isStory = (value: unknown): value is StubStory =>
  typeof value === "object" && value !== null && "input" in value && "meta" in value;

const DIRECTIONS = new Set(["ltr", "rtl"]);

/** Renders a story as Storybook does: its `render` (or the meta's), else the component. */
function StoryRoot({ story }: Readonly<{ story: StubStory }>): ReactNode {
  const meta = story.meta.input;
  const args = { ...meta.args, ...story.input.args };
  const globals = { ...meta.globals, ...story.input.globals };
  const render = story.input.render ?? meta.render;
  if (render !== undefined) return render(args, { args, globals });
  return meta.component === undefined ? null : createElement(meta.component, args);
}

function StoryFrame({ story }: Readonly<{ story: StubStory }>) {
  const globals = { ...story.meta.input.globals, ...story.input.globals };
  const dir = String(globals["dir"]);
  // A story's `dir` global applies to its own canvas. Its `theme` global does not: the page's
  // tokens.css declares literal values per Theme, so component tokens computed on :root can't
  // follow a nested `data-theme` ("the page's values cannot reach inside", craft.md). The page's
  // own Theme switch shows every story in each Theme instead.
  return (
    <div className="ds-story-canvas" dir={DIRECTIONS.has(dir) ? dir : undefined}>
      <StoryRoot story={story} />
    </div>
  );
}

/** A card's preview: every story, named, in file order. */
export function CardPreview({ card }: Readonly<{ card: Card }>) {
  return (
    <div className="ds-stories">
      {card.entries.map(([exportName, story]) => (
        <section key={exportName} className="ds-story">
          <h2 className="ds-story-name">{storyName(exportName)}</h2>
          <StoryFrame story={story} />
        </section>
      ))}
    </div>
  );
}

function cardOf(file: StoryFile, components: Readonly<Record<string, unknown>>): Card | undefined {
  const { module, order } = file;
  const rank = (name: string) => (order.includes(name) ? order.indexOf(name) : order.length);
  const entries: (readonly [string, StubStory])[] = [];
  for (const [name, value] of Object.entries(module))
    if (isStory(value)) entries.push([name, value]);
  entries.sort((a, b) => rank(a[0]) - rank(b[0]));
  const first = entries[0]?.[1];
  if (first === undefined) return undefined;
  const title = first.meta.input.title ?? "";
  const segments = title.split("/");
  const name = segments.at(-1)?.replaceAll(/[^A-Za-z0-9_$]/gv, "") ?? "";
  if (name === "") throw new Error(`Story title "${title}" gives no card name`);
  return {
    name,
    group: segments.length > 1 ? (segments[0] ?? "") : "",
    page: !Object.hasOwn(components, name),
    stories: entries.map(([exportName]) => storyName(exportName)),
    entries,
  };
}

/** Every story file's card, keyed by name. `components` is the bundle namespace. */
export function collectCards(
  files: readonly StoryFile[],
  components: Readonly<Record<string, unknown>>,
): Record<string, Card> {
  const cards: Record<string, Card> = {};
  for (const file of files) {
    const card = cardOf(file, components);
    if (card === undefined) continue;
    if (Object.hasOwn(cards, card.name))
      throw new Error(`Two story files make the card ${card.name}`);
    cards[card.name] = card;
  }
  return cards;
}
