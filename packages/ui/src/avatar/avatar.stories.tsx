import { useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { expect, fn, isInaccessible, waitFor, within } from "storybook/test";

import preview, { partsOf } from "#.storybook/preview.tsx";

import * as Avatar from "./avatar.tsx";

const photo = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#5b7a52"/><circle cx="16" cy="13" r="6" fill="#e8eee4"/><path d="M5 32a11 11 0 0 1 22 0z" fill="#e8eee4"/></svg>',
)}`;
const broken = "data:image/png;base64,broken";
const onLoadingStatusChange = fn<(status: Avatar.LoadingStatus) => void>();

const person = (src: string) => (
  <>
    <Avatar.Image
      src={src}
      alt="Alexandru Bereghici"
      onLoadingStatusChange={onLoadingStatusChange}
    />
    <Avatar.Fallback name="Alexandru Bereghici" />
  </>
);

const imageRef = fn<(image: HTMLImageElement | null) => void>();

function ChangingPhoto() {
  const [src, setSrc] = useState(photo);

  return (
    <>
      <Avatar.Root>{person(src)}</Avatar.Root>
      <button
        type="button"
        onClick={() => {
          setSrc(broken);
        }}
      >
        Change photo
      </button>
    </>
  );
}

const meta = preview.meta({
  title: "Components/Avatar",
  component: Avatar.Root,
  subcomponents: partsOf(Avatar),
  args: { children: person(photo) },
});

export const Default = meta.story({});

Default.test("shows the picture once it has loaded", async ({ canvas }) => {
  await waitFor(() => expect(onLoadingStatusChange).toHaveBeenLastCalledWith("loaded"));
  await waitFor(() => expect(canvas.getByText("AB")).not.toBeVisible());
});

Default.test(
  "shows a server-rendered photo that loaded before hydration",
  async ({ canvasElement }) => {
    const host = document.createElement("div");
    const avatar = <Avatar.Root>{person(photo)}</Avatar.Root>;

    canvasElement.append(host);
    host.innerHTML = renderToString(avatar);
    await within(host).getByRole<HTMLImageElement>("img").decode();

    const root = hydrateRoot(host, avatar);

    await waitFor(() => expect(within(host).getByText("AB")).not.toBeVisible());
    root.unmount();
  },
);

Default.test(
  "reports loading again when the photo changes",
  { render: ChangingPhoto },
  async ({ canvas, userEvent }) => {
    await waitFor(() => expect(onLoadingStatusChange).toHaveBeenLastCalledWith("loaded"));
    onLoadingStatusChange.mockClear();
    await userEvent.click(canvas.getByRole("button", { name: "Change photo" }));
    await waitFor(() => expect(onLoadingStatusChange).toHaveBeenLastCalledWith("error"));
    await expect(onLoadingStatusChange.mock.calls).toEqual([["loading"], ["error"]]);
  },
);

Default.test(
  "hands a callback ref the image once",
  {
    args: {
      children: (
        <Avatar.Image
          src={photo}
          alt="Alexandru Bereghici"
          ref={imageRef}
          onLoadingStatusChange={onLoadingStatusChange}
        />
      ),
    },
  },
  async ({ canvas }) => {
    await waitFor(() => expect(onLoadingStatusChange).toHaveBeenLastCalledWith("loaded"));
    await expect(imageRef.mock.calls).toEqual([
      [canvas.getByRole("img", { name: "Alexandru Bereghici" })],
    ]);
  },
);

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
  // The Fallback is decorative, so its tree is empty, and an empty aria snapshot matches anything.
  tags: ["!aria-snapshot"],
  args: { children: <Avatar.Fallback name="Ana Maria Popescu" /> },
  parameters: {
    docs: {
      description: {
        story:
          'Without an Image, the Fallback shows the first letters of the first and last words. It is decorative: name it with `role="img"` and `aria-label` on Root if it stands alone.',
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
  await expect(isInaccessible(canvas.getByText("AP"))).toBe(true);
});

export const Anonymous = meta.story({
  args: { children: <Avatar.Fallback /> },
  // The Fallback is decorative, so its tree is empty, and an empty aria snapshot matches anything.
  tags: ["!aria-snapshot"],
  parameters: {
    docs: { description: { story: "Without a name, the Fallback shows a generic person glyph." } },
  },
});
