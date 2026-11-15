import { expect } from "storybook/test";

import { ArrowUpRightIcon } from "@abereghici/ui/icons/arrow-up-right";
import { CodeIcon } from "@abereghici/ui/icons/code";
import { FileIcon } from "@abereghici/ui/icons/file";
import { MailIcon } from "@abereghici/ui/icons/mail";

import { withWidth } from "#.storybook/decorators/with-width.tsx";
import preview, { partsOf } from "#.storybook/preview.tsx";
import { trusted } from "#.storybook/test/trusted.ts";

import * as ActionList from "./action-list.tsx";

const meta = preview.meta({
  title: "Components/ActionList",
  component: ActionList.Root,
  subcomponents: partsOf(ActionList),
  args: {
    "aria-label": "Elsewhere",
    children: (
      <>
        <ActionList.LinkItem href="#github">
          <ActionList.LeadingVisual>
            <CodeIcon />
          </ActionList.LeadingVisual>
          GitHub
          <ActionList.Description>@abereghici</ActionList.Description>
          <ActionList.TrailingVisual>
            <ArrowUpRightIcon size="sm" />
          </ActionList.TrailingVisual>
        </ActionList.LinkItem>
        <ActionList.LinkItem href="#email">
          <ActionList.LeadingVisual>
            <MailIcon />
          </ActionList.LeadingVisual>
          Email
          <ActionList.Description>hello@example.com</ActionList.Description>
          <ActionList.TrailingVisual>
            <ArrowUpRightIcon size="sm" />
          </ActionList.TrailingVisual>
        </ActionList.LinkItem>
        <ActionList.LinkItem href="#cv">
          <ActionList.LeadingVisual>
            <FileIcon />
          </ActionList.LeadingVisual>
          CV
        </ActionList.LinkItem>
      </>
    ),
  },
  decorators: [withWidth("22rem")],
});

export const Default = meta.story({});

Default.test(
  "moves from link to link with Tab, each named by its text and described by its description",
  async ({ canvas, userEvent }) => {
    const rows = [
      ["GitHub", "@abereghici"],
      ["Email", "hello@example.com"],
      ["CV", ""],
    ];

    await expect(canvas.getAllByRole("listitem")).toHaveLength(3);

    for (const [name = "", description = ""] of rows) {
      await userEvent.tab();
      await expect(canvas.getByRole("link", { name })).toHaveFocus();
      await expect(canvas.getByRole("link", { name })).toHaveAccessibleDescription(description);
    }
  },
);

Default.test(
  "makes your router's link the row with asChild",
  {
    args: {
      children: (
        <ActionList.LinkItem asChild>
          <a href="#posts">
            Posts
            <ActionList.Description>Notes on design systems</ActionList.Description>
          </a>
        </ActionList.LinkItem>
      ),
    },
  },
  async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Posts" });

    await expect(link).toHaveAttribute("href", "#posts");
    await expect(link).toHaveAccessibleDescription("Notes on design systems");
  },
);

export const Hovered = meta.story({
  tags: ["!autodocs"],
  play: async ({ canvas }) => {
    const user = await trusted().catch(() => null);

    await user?.hover(canvas.getByRole("link", { name: "Email" }));
  },
});

export const Focused = meta.story({
  tags: ["!autodocs"],
  play: async () => {
    const user = await trusted().catch(() => null);

    await user?.keyboard("{Tab}");
  },
});

export const WorstCase = meta.story({
  tags: ["!autodocs"],
  args: {
    children: (
      <>
        <ActionList.LinkItem href="#northwind">
          <ActionList.LeadingVisual>
            <MailIcon />
          </ActionList.LeadingVisual>
          Adresse e-mail professionnelle de facturation
          <ActionList.Description>
            bartholomew.fitzgerald@northwind-industries-holdings.example.com
          </ActionList.Description>
          <ActionList.TrailingVisual>
            <ArrowUpRightIcon size="sm" />
          </ActionList.TrailingVisual>
        </ActionList.LinkItem>
        <ActionList.LinkItem href="#weibo">设计系统笔记</ActionList.LinkItem>
      </>
    ),
  },
  decorators: [withWidth("18rem")],
});
