import { expect } from "storybook/test";

import preview from "#.storybook/preview.tsx";

import { Skeleton } from "./skeleton.tsx";

const save = (
  <button type="button" style={{ borderRadius: "999px", paddingInline: "1rem" }}>
    Save changes
  </button>
);

const meta = preview.meta({
  title: "Components/Feedback/Skeleton",
  component: Skeleton,
  args: { children: "Placeholder name" },
});

export const Default = meta.story({});

Default.test("hides its placeholder text from assistive technology", async ({ canvas }) => {
  await expect(canvas.getByText("Placeholder name")).toHaveAttribute("aria-hidden", "true");
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
  "holds a line of space when empty",
  { args: { children: undefined, style: { inlineSize: "12rem" } } },
  async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("[aria-hidden]")).toBeVisible();
  },
);

Default.test("keeps its colour pulse under reduced motion", async ({ canvas }) => {
  await expect(canvas.getByText("Placeholder name").getAnimations()).toHaveLength(1);
});
