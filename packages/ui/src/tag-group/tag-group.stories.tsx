import { useState } from "react";
import { expect, fn } from "storybook/test";

import preview, { partsOf } from "#.storybook/preview.tsx";
import { listen } from "#.storybook/test/listen.ts";
import { trusted } from "#.storybook/test/trusted.ts";

import { TagGroup } from "./index.ts";

const statuses: Readonly<Record<string, string>> = {
  draft: "Draft",
  review: "In review",
  live: "Live",
};

const meta = preview.meta({
  title: "Components/TagGroup",
  component: TagGroup.Root,
  subcomponents: partsOf(TagGroup),
  args: {
    "aria-label": "Filters",
    removeLabel: "Remove",
    defaultValue: ["draft", "review", "live"],
    children: (
      <>
        <TagGroup.Tag value="draft">Draft</TagGroup.Tag>
        <TagGroup.Tag value="review">In review</TagGroup.Tag>
        <TagGroup.Tag value="live" variant="success">
          Live
        </TagGroup.Tag>
      </>
    ),
    onValueChange: fn<(value: string[], details: TagGroup.ChangeEventDetails) => void>(),
  },
});

export const Default = meta.story({});

Default.test(
  "removes a tag on click, reports remove-press and dispatches one ab-dismiss",
  async ({ canvas, userEvent, args }) => {
    const remove = canvas.getByRole("button", { name: "Remove In review" });
    const dismisses = listen("ab-dismiss");

    await userEvent.click(remove);
    dismisses.stop();
    await expect(canvas.queryByText("In review")).toBeNull();
    await expect(args.onValueChange).toHaveBeenCalledOnce();
    await expect(args.onValueChange).toHaveBeenCalledWith(
      ["draft", "live"],
      expect.objectContaining({ reason: "remove-press" }),
    );
    await expect(dismisses.events.map(({ target, detail }) => ({ target, detail }))).toEqual([
      { target: remove, detail: { component: "TagGroup", reason: "user" } },
    ]);
  },
);

Default.test(
  "moves focus to the next tag's remove button, or the previous one after the last tag",
  async ({ canvas }) => {
    const user = await trusted();

    await user.keyboard("{Tab}{Tab}{Enter}");
    await expect(canvas.getByRole("button", { name: "Remove Live" })).toHaveFocus();
    await user.keyboard("{Enter}");
    await expect(canvas.getByRole("button", { name: "Remove Draft" })).toHaveFocus();
  },
);

Default.test(
  "focuses the group once its last tag is removed",
  { args: { defaultValue: ["live"] } },
  async ({ canvas }) => {
    const user = await trusted();

    await user.keyboard("{Tab}{Enter}");
    await expect(canvas.getByRole("list", { name: "Filters" })).toHaveFocus();
  },
);

Default.test(
  "leaves focus where onValueChange moves it",
  {
    decorators: [
      (Story) => (
        <>
          <input aria-label="Add a filter" />
          <Story />
        </>
      ),
    ],
    args: {
      onValueChange: () => {
        document.querySelector<HTMLInputElement>('[aria-label="Add a filter"]')?.focus();
      },
    },
  },
  async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Remove Draft" }));
    await expect(canvas.getByRole("textbox", { name: "Add a filter" })).toHaveFocus();
  },
);

Default.test(
  "keeps the tag and its focus when the removal is cancelled",
  {
    args: {
      onValueChange: (_value, details) => {
        details.cancel();
      },
    },
  },
  async ({ canvas, userEvent }) => {
    const remove = canvas.getByRole("button", { name: "Remove Draft" });
    const dismisses = listen("ab-dismiss");

    await userEvent.click(remove);
    dismisses.stop();
    await expect(remove).toBeVisible();
    await expect(remove).toHaveFocus();
    await expect(dismisses.events).toEqual([]);
  },
);

Default.test(
  "keeps its tags, focusable, when disabled",
  { args: { disabled: true } },
  async ({ canvas, userEvent, args }) => {
    const remove = canvas.getByRole("button", { name: "Remove Draft" });

    await userEvent.click(remove);
    await expect(remove).toHaveFocus();
    await expect(remove).toHaveAttribute("aria-disabled", "true");
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
);

function ControlledTagGroup({ defaultValue = [], ...args }: TagGroup.RootProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <TagGroup.Root
      {...args}
      value={value}
      onValueChange={(next, details) => {
        setValue(next);
        args.onValueChange?.(next, details);
      }}
    >
      {value.map((key) => (
        <TagGroup.Tag key={key} value={key}>
          {statuses[key]}
        </TagGroup.Tag>
      ))}
    </TagGroup.Root>
  );
}

export const Controlled = meta.story({
  args: { defaultValue: ["draft", "review"] },
  render: ControlledTagGroup,
  parameters: {
    docs: {
      description: { story: "The app holds the tags in state and renders a Tag for each." },
    },
  },
});

Controlled.test("follows the value the app holds", async ({ canvas, userEvent, args }) => {
  await userEvent.click(canvas.getByRole("button", { name: "Remove Draft" }));
  await expect(canvas.queryByText("Draft")).toBeNull();
  await expect(args.onValueChange).toHaveBeenCalledWith(["review"], expect.anything());
});
