import { textOf } from "./text-of.ts";

type Key = Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey" | "altKey">;

const typed = new WeakMap<Element, { text: string; at: number }>();

const TYPEAHEAD_WINDOW = 500;

/** Whether a key types: one printable character with neither Ctrl, Meta nor Alt held, as a native `<select>` takes it. */
export function isTypeaheadKey({ key, ctrlKey, metaKey, altKey }: Key) {
  return key.length === 1 && !ctrlKey && !metaKey && !altKey;
}

/**
 * The first of `items` after `from`, wrapping, whose text starts with the keys typed into
 * `container` in quick succession; the same key typed again steps through the items it starts.
 * `null` when the key types nothing or no item starts with what was typed.
 */
export function typeahead(
  container: Element,
  event: Key,
  items: readonly HTMLElement[],
  from: Element | null,
) {
  if (!isTypeaheadKey(event)) return null;

  const { key } = event;
  const last = typed.get(container);
  const now = performance.now();
  const query = last !== undefined && now - last.at < TYPEAHEAD_WINDOW ? last.text + key : key;

  typed.set(container, { text: query, at: now });

  const start = from instanceof HTMLElement ? items.indexOf(from) : -1;
  const repeat = query === key.repeat(query.length) ? key : query;
  const order = [...items.slice(start + 1), ...items.slice(0, start + 1)];

  return order.find((item) => textOf(item).toLowerCase().startsWith(repeat.toLowerCase())) ?? null;
}
