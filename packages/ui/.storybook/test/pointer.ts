/** What a pointer pressed at the element's centre would hit: the element itself when the user can see and reach it. */
export function atCentre(element: Element) {
  const { x, y, width, height } = element.getBoundingClientRect();

  return document.elementFromPoint(x + width / 2, y + height / 2);
}

/**
 * Drags one finger from the element's centre by `x` and `y` pixels, as trusted touch input that
 * the browser may turn into a page scroll. Playwright has no touch drag, so it goes through CDP.
 */
export async function touchDrag(element: Element, x: number, y: number) {
  const { cdp } = await import("vitest/browser");
  const frame = window.frameElement?.getBoundingClientRect() ?? new DOMRect();
  const from = element.getBoundingClientRect();
  const at = (fraction: number) => [
    {
      x: frame.x + from.x + from.width / 2 + x * fraction,
      y: frame.y + from.y + from.height / 2 + y * fraction,
    },
  ];

  await cdp().send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: at(0) });

  for (const fraction of [0.25, 0.5, 0.75, 1]) {
    await cdp().send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: at(fraction) });
  }

  await cdp().send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}
