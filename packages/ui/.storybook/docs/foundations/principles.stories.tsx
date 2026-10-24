import { expect } from "storybook/test";

import preview from "#.storybook/preview.tsx";

import { Direction as DirectionSection, InteractionPrinciples, Principles } from "./brand.tsx";

const meta = preview.meta({ title: "Foundations/Principles", tags: ["!autodocs"] });

export const System = meta.story({ render: () => <Principles /> });

System.test("states the eight principles in order", async ({ canvas }) => {
  await expect(canvas.getAllByRole("term").map((term) => term.textContent)).toEqual([
    "1 · Accessible by construction",
    "2 · Semantic first",
    "3 · Predictable names",
    "4 · Rationed color",
    "5 · Flat in flow, lifted when floating",
    "6 · Purposeful motion",
    "7 · Keyboard first, pointer friendly",
    "8 · Platform before script",
  ]);
});

export const Direction = meta.story({ render: () => <DirectionSection /> });

export const Interaction = meta.story({ render: () => <InteractionPrinciples /> });
