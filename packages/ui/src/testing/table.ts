import { within } from "storybook/test";

/**
 * The text of a table cell, found the way a reader finds it: the row by its accessible name
 * (which starts with the row's first cell), the column by its header text. Story tests only.
 */
export function cellText(scope: HTMLElement, row: RegExp, column: string): string | undefined {
  const rowElement = within(scope).getByRole("row", { name: row });
  const headers = [...(rowElement.closest("table")?.querySelectorAll("thead th") ?? [])];
  const index = headers.findIndex((header) => header.textContent === column);
  return rowElement.children.item(index)?.textContent ?? undefined;
}

/** A row name pattern for a token row: `--ab-<name>` followed by the next cell. */
export const tokenRow = (name: string) => new RegExp(`--ab-${name} `, "v");
