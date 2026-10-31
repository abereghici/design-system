import { textOf } from "./text-of.ts";

const typed = new WeakMap<Element, { text: string; at: number }>();

const TYPEAHEAD_WINDOW = 500;

/**
 * The first of `items` after `from`, wrapping, whose text starts with the keys typed into
 * `container` in quick succession; the same key typed again steps through the items it starts.
 */
export function typeahead(
  container: Element,
  key: string,
  items: readonly HTMLElement[],
  from: Element | null,
) {
  const last = typed.get(container);
  const now = performance.now();
  const query = last !== undefined && now - last.at < TYPEAHEAD_WINDOW ? last.text + key : key;

  typed.set(container, { text: query, at: now });

  const start = from instanceof HTMLElement ? items.indexOf(from) : -1;
  const repeat = query === key.repeat(query.length) ? key : query;
  const order = [...items.slice(start + 1), ...items.slice(0, start + 1)];

  return order.find((item) => textOf(item).toLowerCase().startsWith(repeat.toLowerCase()));
}
