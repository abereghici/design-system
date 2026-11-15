import type { ReactNode } from "react";
import { expect } from "storybook/test";

import { BriefcaseIcon } from "@abereghici/ui/icons/briefcase";
import { CapIcon } from "@abereghici/ui/icons/cap";
import { Text } from "@abereghici/ui/text";

import { withWidth } from "#.storybook/decorators/with-width.tsx";
import preview, { partsOf } from "#.storybook/preview.tsx";

import * as Timeline from "./timeline.tsx";

// An array, as a mapped list of entries is: Root counts its children to mark the reached ones.
const entry = (role: string, years: string, marker?: ReactNode) => (
  <Timeline.Item key={role} marker={marker}>
    <Text variant="label">{role}</Text>
    <Text size="sm" color="subtle">
      {years}
    </Text>
  </Timeline.Item>
);

const meta = preview.meta({
  title: "Components/Timeline",
  component: Timeline.Root,
  subcomponents: partsOf(Timeline),
  args: {
    "aria-label": "Work history",
    active: 1,
    children: [
      entry("Studied computer science", "2012 – 2016"),
      entry("Front-end engineer at Northwind", "2016 – 2021"),
      entry("Design system lead at Contoso", "2021 – now"),
      entry("Next: your team", "2027"),
    ],
  },
});

export const Default = meta.story({});

Default.test("is a list that says how many entries it has", async ({ canvas }) => {
  const list = canvas.getByRole("list", { name: "Work history" });

  await expect(list).toBeVisible();
  await expect(canvas.getAllByRole("listitem")).toHaveLength(4);
});

export const CustomMarker = meta.story({
  args: {
    children: [
      entry("Studied computer science", "2012 – 2016", <CapIcon size="sm" />),
      entry("Front-end engineer at Northwind", "2016 – 2021", <BriefcaseIcon size="sm" />),
      entry("Design system lead at Contoso", "2021 – now", <BriefcaseIcon size="sm" />),
    ],
  },
  parameters: {
    docs: {
      description: {
        story: "Each entry's `marker` replaces the dot, on the same rail and in the same colours.",
      },
    },
  },
});

export const WorstCase = meta.story({
  tags: ["!autodocs"],
  args: {
    active: 0,
    children: [
      entry(
        "Ingénieure principale en systèmes de conception chez Northwind Industries Holdings",
        "Septembre 2016 – décembre 2021 · https://northwind-industries-holdings.example.com/careers/q3-2026",
      ),
      entry("设计系统负责人", "2021 – 至今"),
    ],
  },
  decorators: [withWidth("18rem")],
});
