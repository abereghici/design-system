import preview from "#.storybook/preview.tsx";
import { CheckIcon } from "@platform/ui/icons/check";
import { expect } from "storybook/test";

import { Tag } from "./tag.tsx";

const meta = preview.meta({
  title: "Components/Tag",
  component: Tag,
  args: { children: "Draft" },
  parameters: {
    docs: {
      description: {
        component:
          'A static label for status, type or topic ("Draft", "Live", "Failed"), read in line with its neighbours. It is never a button: to filter, use SegmentedControl or Checkbox. For a count, use a Badge (shadcn and Radix call this component Badge); for a state marker in a dense list, a StatusDot.',
      },
    },
  },
});

export const Default = meta.story({});

Default.test(
  "wraps a long label instead of overflowing its container",
  {
    args: { children: "Awaitingsecondreviewerapproval" },
    decorators: [
      (Story) => (
        <div style={{ inlineSize: "8rem" }}>
          <Story />
        </div>
      ),
    ],
  },
  async ({ canvas }) => {
    const tag = canvas.getByText("Awaitingsecondreviewerapproval");
    await expect(tag.getBoundingClientRect().width).toBeLessThanOrEqual(
      tag.parentElement?.getBoundingClientRect().width ?? 0,
    );
  },
);

export const WithIcon = meta.story({
  args: {
    variant: "success",
    children: (
      <>
        <CheckIcon data-icon="inline-start" /> Live
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'An icon is a child marked `data-icon="inline-start"`. It is decorative and takes the label colour.',
      },
    },
  },
});

WithIcon.test("hides its icon from assistive technology", async ({ canvas }) => {
  await expect(canvas.queryByRole("img")).toBeNull();
  await expect(canvas.getByText("Live")).toBeVisible();
});
