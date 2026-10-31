import { shownOf } from "./options.ts";
import { textOf } from "./text-of.ts";

interface Search {
  readonly collator: Intl.Collator;
  readonly graphemes: Intl.Segmenter;
  readonly words: Intl.Segmenter;
}

const searches = new Map<string, Search>();

function search(locale: Intl.LocalesArgument): Search {
  let found = searches.get(String(locale));

  if (found === undefined) {
    found = {
      collator: new Intl.Collator(locale, { usage: "search", sensitivity: "base" }),
      graphemes: new Intl.Segmenter(locale),
      words: new Intl.Segmenter(locale, { granularity: "word" }),
    };
    searches.set(String(locale), found);
  }

  return found;
}

/**
 * How well `query` matches the best of `texts`: 0 a prefix, 1 a word start, 2 a subsequence,
 * `undefined` no match. An empty query matches everything as a prefix.
 */
function rank(
  texts: readonly string[],
  query: string,
  locale: Intl.LocalesArgument,
): number | undefined {
  if (query === "") return 0;

  const { collator, graphemes, words } = search(locale);
  const needle = query.normalize("NFC");
  const characters = [...graphemes.segment(needle)].map(({ segment }) => segment);
  const tiers = texts.map((raw) => {
    const text = raw.normalize("NFC");
    const at = (index: number) =>
      collator.compare(text.slice(index, index + needle.length), needle) === 0;

    if (at(0)) return 0;

    if ([...words.segment(text)].some(({ index, isWordLike }) => isWordLike === true && at(index)))
      return 1;

    let next = 0;

    for (const { segment } of graphemes.segment(text)) {
      if (next < characters.length && collator.compare(segment, characters[next] ?? "") === 0)
        next += 1;
    }

    return next === characters.length ? 2 : undefined;
  });
  const found = tiers.filter((tier) => tier !== undefined);

  return found.length === 0 ? undefined : Math.min(...found);
}

/**
 * Ranks every option's `data-label` (else its text) and `data-keywords` against `query`; a `null`
 * locale or an empty query shows all. Hides non-matches and empty groups, numbers the shown options,
 * and returns them.
 */
export function filterOptions(
  list: Element | null,
  query: string,
  locale: Intl.LocalesArgument | null,
) {
  for (const option of list?.querySelectorAll<HTMLElement>('[role="option"]') ?? []) {
    const keywords = option.dataset["keywords"]?.split("\n") ?? [];
    const label = option.dataset["label"] ?? textOf(option);
    const tier = locale === null || query === "" ? 0 : rank([label, ...keywords], query, locale);

    if (option.hidden !== (tier === undefined)) option.hidden = tier === undefined;

    const order = tier === undefined || tier === 0 ? "" : String(tier);

    if (option.style.order !== order) option.style.order = order;
  }

  for (const group of list?.querySelectorAll<HTMLElement>("fieldset") ?? []) {
    group.hidden = group.querySelector('[role="option"]:not([hidden])') === null;
  }

  const shown = shownOf(list);

  for (const siblings of Map.groupBy(shown, (option) => option.parentElement).values()) {
    for (const [index, option] of siblings.entries()) {
      option.setAttribute("aria-posinset", String(index + 1));
      option.setAttribute("aria-setsize", String(siblings.length));
    }
  }

  return shown;
}
