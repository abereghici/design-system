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
export function rank(
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
