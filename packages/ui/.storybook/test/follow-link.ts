/**
 * Follows a link to `element`, which reveals `hidden="until-found"` content the way find-in-page
 * does (the same `beforematch`, then the same reveal); Playwright can't drive find-in-page.
 */
export function followLinkTo(element: Element) {
  const url = location.href;

  location.hash = element.id;
  // A fragment left in the Vitest tester's URL would leak into the next proof.
  history.replaceState(history.state, "", url);
}
