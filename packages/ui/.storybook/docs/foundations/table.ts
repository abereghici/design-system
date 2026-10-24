import { within } from "storybook/test";

export function cellText(scope: HTMLElement, row: RegExp, column: string): string | undefined {
  const rowElement = within(scope).getByRole("row", { name: row });
  const headers = [...(rowElement.closest("table")?.querySelectorAll("thead th") ?? [])];
  const index = headers.findIndex((header) => header.textContent === column);
  return rowElement.children.item(index)?.textContent ?? undefined;
}

export const tokenRow = (name: string) => new RegExp(`--ab-${name} `, "v");
