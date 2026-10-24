import { expect } from "storybook/test";

import preview from "#.storybook/preview.tsx";

function Sample() {
  return (
    <article>
      <h1>A heading long enough to wrap onto a second line on a narrow screen</h1>
      <p>
        Body text follows the reader&rsquo;s default size and wraps without leaving a single word on
        its last line.
      </p>
      <button type="button">Save changes</button>
    </article>
  );
}

const meta = preview.meta({
  title: "Foundations/Base stylesheet",
  component: Sample,
  tags: ["!autodocs"],
});

export const Elements = meta.story({});

Elements.test("yields to unlayered app CSS", async ({ canvas, userEvent }) => {
  const appStyles = document.createElement("style");
  appStyles.textContent = "button { outline-color: rgb(1, 2, 3); }";
  document.head.append(appStyles);
  try {
    const button = canvas.getByRole("button", { name: "Save changes" });
    await userEvent.tab();
    await expect(getComputedStyle(button).outlineColor).toBe("rgb(1, 2, 3)");
  } finally {
    appStyles.remove();
  }
});
