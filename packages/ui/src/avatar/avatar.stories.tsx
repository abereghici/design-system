import preview from "#.storybook/preview.tsx";
import { expect, fn, waitFor } from "storybook/test";

import * as Avatar from "./avatar.tsx";

const photo = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#5b7a52"/><circle cx="16" cy="13" r="6" fill="#e8eee4"/><path d="M5 32a11 11 0 0 1 22 0z" fill="#e8eee4"/></svg>',
)}`;
const broken = "data:image/png;base64,broken";
const onLoadingStatusChange = fn<(status: Avatar.LoadingStatus) => void>();

const person = (src: string) => (
  <>
    <Avatar.Image src={src} alt="Alexandru Bereghici" onLoadingStatusChange={onLoadingStatusChange} />
    <Avatar.Fallback name="Alexandru Bereghici" />
  </>
);

const meta = preview.meta({
  title: "Components/Avatar",
  component: Avatar.Root,
  args: { children: person(photo) },
  parameters: {
    docs: {
      description: {
        component:
          "A person's picture, with their initials (or a generic glyph) while it loads or when it fails. The Image's `alt` is the avatar's one accessible name, whichever Part shows; the Fallback is never announced. When the name is written beside it, use `alt=\"\"` and `aria-hidden` on Root. For the brand sign, use the Logo.",
      },
    },
  },
});

export const Default = meta.story({});

Default.test("is named by its image's alt", async ({ canvas }) => {
  await expect(canvas.getByRole("img", { name: "Alexandru Bereghici" })).toBeInTheDocument();
});

Default.test("shows the picture once it has loaded", async ({ canvas }) => {
  await waitFor(() => expect(onLoadingStatusChange).toHaveBeenLastCalledWith("loaded"));
  await waitFor(() => expect(canvas.getByText("AB")).not.toBeVisible());
});

Default.test(
  "keeps the initials when the picture fails, with the same name",
  { args: { children: person(broken) } },
  async ({ canvas }) => {
    await waitFor(() => expect(onLoadingStatusChange).toHaveBeenLastCalledWith("error"));
    await expect(canvas.getByText("AB")).toBeVisible();
    await expect(canvas.getByRole("img", { name: "Alexandru Bereghici" })).toBeInTheDocument();
  },
);

export const Initials = meta.story({
  args: { children: <Avatar.Fallback name="Ana Maria Popescu" /> },
  parameters: {
    docs: {
      description: {
        story:
          "Without an Image, the Fallback shows the first letters of the first and last words. It is decorative: name it with `role=\"img\"` and `aria-label` on Root if it stands alone.",
      },
    },
  },
});

Initials.test("takes the first and last words' first letters", async ({ canvas }) => {
  await expect(canvas.getByText("AP")).toBeVisible();
});

Initials.test(
  "keeps a letter with its combining mark whole",
  { args: { children: <Avatar.Fallback name={"Émile"} /> } },
  async ({ canvas }) => {
    await expect(canvas.getByText("É")).toBeVisible();
  },
);

Initials.test("is not announced", async ({ canvas }) => {
  await expect(canvas.getByText("AP")).toHaveAttribute("aria-hidden", "true");
});
