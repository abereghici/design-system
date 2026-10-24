import { expect, within } from "storybook/test";

import preview from "#.storybook/preview.tsx";

import { Families, FontSizes, TypeRoles } from "./type.tsx";

const meta = preview.meta({
  title: "Foundations/Type",
  tags: ["!autodocs"],
});

export const Roles = meta.story({ render: () => <TypeRoles /> });

const ROLES = [
  "type-heading-lg",
  "type-heading-md",
  "type-heading-sm",
  "type-heading-xs",
  "type-display-md",
  "type-body-lg",
  "type-body-md",
  "type-body-sm",
  "type-body-xs",
  "type-label-lg",
  "type-label-sm",
  "type-kbd-sm",
  "type-label-md",
  "type-data-md",
  "type-data-sm",
  "type-code-md",
  "type-overline-sm",
];

Roles.test("renders a specimen of every type role", async ({ canvas }) => {
  const list = within(canvas.getByRole("table", { name: "Type roles" }));
  const names = list.getAllByRole("rowheader").map((cell) => cell.textContent);
  await expect(names).toEqual(ROLES.map((role) => `--ab-${role}`));
});

export const FontFamilies = meta.story({ render: () => <Families /> });

export const Sizes = meta.story({ render: () => <FontSizes /> });
