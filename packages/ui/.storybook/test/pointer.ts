/** What a pointer pressed at the element's centre would hit: the element itself when the user can see and reach it. */
export function atCentre(element: Element) {
  const { x, y, width, height } = element.getBoundingClientRect();

  return document.elementFromPoint(x + width / 2, y + height / 2);
}
