import { expect, isInaccessible } from "storybook/test";

import preview from "#.storybook/preview.tsx";
import { animates, moves } from "#.storybook/test/motion.ts";

import { Skeleton } from "./skeleton.tsx";

const save = (
  <button type="button" style={{ borderRadius: "999px", paddingInline: "1rem" }}>
    Save changes
  </button>
);

const meta = preview.meta({
  title: "Components/Skeleton",
  component: Skeleton,
  args: { children: "Placeholder name" },
  // Hidden from assistive technology, so its tree is empty, and an empty aria snapshot matches anything.
  parameters: { ariaSnapshot: { disable: true } },
});

export const Default = meta.story({});

Default.test("hides its placeholder text from assistive technology", async ({ canvas }) => {
  await expect(isInaccessible(canvas.getByText("Placeholder name"))).toBe(true);
});

Default.test(
  "keeps a wrapped control out of reach while loading",
  { args: { children: save } },
  async ({ canvas, userEvent }) => {
    await expect(canvas.queryByRole("button")).toBeNull();
    await userEvent.tab();
    await expect(document.body).toHaveFocus();
  },
);

Default.test(
  "shows its content once loaded",
  { args: { loading: false, children: save } },
  async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Save changes" })).toHaveFocus();
  },
);

Default.test(
  "keeps a wrapped element's class beside the consumer's",
  { args: { children: <span className="avatar">Ana Pop</span>, className: "wide" } },
  async ({ canvas }) => {
    await expect(canvas.getByText("Ana Pop")).toHaveClass("avatar", "wide");
  },
);

Default.test("pulses without moving, also under reduced motion", async ({ canvas }) => {
  const placeholder = canvas.getByText("Placeholder name");

  await expect(animates(placeholder)).toBe(true);
  await expect(moves(placeholder)).toBe(false);
});

export const AroundAnElement = meta.story({
  args: { children: save },
  parameters: {
    docs: {
      description: {
        story: "Around an element, it takes that element's size and shape, here a pill button.",
      },
    },
  },
});

export const Empty = meta.story({
  parameters: { docs: { description: { story: "With no children it holds one line of space." } } },
  args: { children: undefined, style: { inlineSize: "12rem" } },
});
