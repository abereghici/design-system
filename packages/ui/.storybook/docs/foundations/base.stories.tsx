import preview from "#.storybook/preview.tsx";
import { expect } from "storybook/test";

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

// Expected values are the token source's literals (packages/tokens/src/tokens/*.tokens.json):
// focus-ring-width = dimension-2 (2px), focus-ring-offset = dimension-3 (3px),
// light color-border-focused = palette-moss-900 #263316.
Elements.test("draws the focus ring on keyboard focus", async ({ canvas, userEvent }) => {
  const button = canvas.getByRole("button", { name: "Save changes" });
  await userEvent.tab();
  await expect(button).toHaveFocus();
  const style = getComputedStyle(button);
  await expect([
    style.outlineStyle,
    style.outlineWidth,
    style.outlineOffset,
    style.outlineColor,
  ]).toEqual(["solid", "2px", "3px", "rgb(38, 51, 22)"]);
});

// light color-background-highlight = palette-ember-100 #ffd8ac,
// color-text-on-highlight = palette-sage-950 #171914.
Elements.test("marks selected text with the highlight Role", async ({ canvas }) => {
  const style = getComputedStyle(canvas.getByRole("heading"), "::selection");
  await expect([style.backgroundColor, style.color]).toEqual([
    "rgb(255, 216, 172)",
    "rgb(23, 25, 20)",
  ]);
});

// type-body-md: font-family-figtree, font-size-17 (1.0625rem = 17px at the default root size),
// line-height-160 (1.6, so 27.2px).
Elements.test("sets body text and form controls in the body type role", async ({ canvas }) => {
  const paragraph = getComputedStyle(canvas.getByText(/^Body text/v));
  const button = getComputedStyle(canvas.getByRole("button", { name: "Save changes" }));
  await expect([paragraph.fontFamily, paragraph.fontSize]).toEqual([
    "Figtree, system-ui, sans-serif",
    "17px",
  ]);
  // WebKit serialises 1.6 × 17px as 27.200001px.
  await expect(Number(paragraph.lineHeight.replace("px", ""))).toBeCloseTo(27.2, 4);
  await expect([button.fontFamily, button.fontSize]).toEqual([
    "Figtree, system-ui, sans-serif",
    "17px",
  ]);
});

Elements.test("reserves a stable scrollbar gutter", async () => {
  await expect(getComputedStyle(document.documentElement).scrollbarGutter).toBe("stable");
});

// `text-wrap: pretty` and `interpolate-size` are not in every engine (docs/research/
// base-stylesheet.md); an engine that doesn't know them ignores the declaration.
Elements.test("balances headings and wraps paragraphs prettily", async ({ canvas }) => {
  const heading = getComputedStyle(canvas.getByRole("heading"));
  const paragraph = getComputedStyle(canvas.getByText(/^Body text/v));
  await expect(heading.textWrapStyle).toBe("balance");
  if (CSS.supports("text-wrap-style", "pretty")) {
    await expect(paragraph.textWrapStyle).toBe("pretty");
  }
});

Elements.test("lets sizes transition to keywords unless motion is reduced", async () => {
  if (!CSS.supports("interpolate-size", "allow-keywords")) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  await expect(
    getComputedStyle(document.documentElement).getPropertyValue("interpolate-size"),
  ).toBe(reduced ? "numeric-only" : "allow-keywords");
});

Elements.test("yields to unlayered app CSS", async ({ canvas, userEvent }) => {
  const appStyles = document.createElement("style");
  // A type selector (0,0,1) beats the base `:focus-visible` (0,1,0) only because the base sits
  // in a cascade layer and this rule doesn't.
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

export const DarkRightToLeft = meta.story({ globals: { theme: "dark", dir: "rtl" } });

// dark color-border-focused = palette-lichen-200 #eceac9; dark color-surface-default =
// palette-night-950 #12150f.
DarkRightToLeft.test("follows the Theme", async ({ canvas, userEvent }) => {
  const button = canvas.getByRole("button", { name: "Save changes" });
  await userEvent.tab();
  await expect(getComputedStyle(button).outlineColor).toBe("rgb(236, 234, 201)");
  await expect(getComputedStyle(document.documentElement).backgroundColor).toBe("rgb(18, 21, 15)");
});
