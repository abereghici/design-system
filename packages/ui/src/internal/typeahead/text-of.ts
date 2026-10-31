/** The element's text without its Kbd hints. */
export function textOf(element: Element | null | undefined) {
  const clone = element?.cloneNode(true);

  if (!(clone instanceof Element)) return "";

  for (const kbd of clone.querySelectorAll("kbd")) kbd.remove();

  return clone.textContent.trim();
}
