// WCAG 2.3.3 "motion animation" is movement, not a change of colour or opacity:
// https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
const movement = /^(?:transform|translate|rotate|scale|inset|top|right|bottom|left|margin)/v;

const animations = (element: Element) =>
  element
    .getAnimations({ subtree: true })
    .flatMap(({ effect }) => (effect instanceof KeyframeEffect ? [effect] : []));

/** Whether the element or anything in it is animating. */
export const animates = (element: Element) => animations(element).length > 0;

/** Whether the element or anything in it moves, which reduced motion must stop. */
export const moves = (element: Element) =>
  animations(element).some((effect) =>
    effect.getKeyframes().some((frame) => Object.keys(frame).some((key) => movement.test(key))),
  );
