/** The highlighted option in `list`, if any. */
export const highlightedIn = (list: Element | null) =>
  list?.querySelector<HTMLElement>('[role="option"][data-highlighted]') ?? null;

/**
 * Highlights `option` in `list` (`null` clears it) as `input`'s active descendant. A single-choice
 * list marks it selected too; a multiple-choice one leaves selected to the chosen options.
 */
export function highlight(
  list: HTMLElement | null,
  input: HTMLInputElement | null,
  option: HTMLElement | null,
) {
  const previous = highlightedIn(list);
  const single = list?.getAttribute("aria-multiselectable") !== "true";

  if (option === previous) return;

  if (previous !== null) {
    delete previous.dataset["highlighted"];

    if (single) previous.removeAttribute("aria-selected");
  }

  if (option === null) {
    input?.removeAttribute("aria-activedescendant");

    return;
  }

  option.dataset["highlighted"] = "";

  if (single) option.setAttribute("aria-selected", "true");

  input?.setAttribute("aria-activedescendant", option.id);
}

/** Scrolls `option` into view, with its group's heading when it is the group's first shown option. */
export function reveal(option: HTMLElement, shown: readonly HTMLElement[]) {
  const group = option.parentElement;
  const previous = shown[shown.indexOf(option) - 1];

  if (group?.localName === "fieldset" && previous?.parentElement !== group) {
    group.firstElementChild?.scrollIntoView({ block: "nearest" });
  }

  option.scrollIntoView({ block: "nearest" });
}
