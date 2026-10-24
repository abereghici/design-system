import preview from "#.storybook/preview.tsx";
import { expect, within } from "storybook/test";

import { Families, FontSizes, SPECIMEN_TEXT, TypeRoles } from "./type.tsx";

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

Roles.test("sets each specimen in its role", async ({ canvas }) => {
  const sample = (role: string) =>
    getComputedStyle(
      within(canvas.getByRole("row", { name: new RegExp(`^--ab-${role} `, "v") })).getByText(
        SPECIMEN_TEXT,
      ),
    );
  // WebKit serialises family names without quotes; Chromium and Firefox quote them.
  const family = (role: string) => sample(role).fontFamily.replaceAll('"', "");
  await expect(family("type-heading-lg")).toBe("Noto Serif, Georgia, serif");
  await expect(sample("type-heading-lg").fontWeight).toBe("500");
  await expect(sample("type-overline-sm").textTransform).toBe("uppercase");
  await expect(family("type-code-md")).toBe("ui-monospace, SF Mono, Menlo, Consolas, monospace");
});

// `document.fonts.ready` can settle before layout requests a face, so load the faces that cover "șț" directly.
Roles.test("loads the latin-ext faces the sample text needs", async () => {
  const faces = await Promise.all([
    document.fonts.load('500 16px "Noto Serif"', "șț"),
    document.fonts.load('400 16px "Figtree"', "șț"),
  ]);
  await expect(faces.map((list) => list.map((face) => face.status))).toEqual([
    ["loaded"],
    ["loaded"],
  ]);
});

export const FontFamilies = meta.story({ render: () => <Families /> });

export const Sizes = meta.story({ render: () => <FontSizes /> });
