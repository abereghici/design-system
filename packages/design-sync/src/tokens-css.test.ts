import { expect, test } from "vitest";

import { compileTokensCss, type TokensJson } from "./tokens-css.ts";

const TOKENS: TokensJson = {
  name: "Acme",
  color: {
    themes: [{ id: "light" }, { id: "dark" }],
    tokens: [
      { name: "ab-surface", value: { light: "#ffffff", dark: "#12150f" } },
      { name: "ab-brand", value: "#263316" },
    ],
  },
  type: {
    families: { figtree: "Figtree, system-ui, sans-serif" },
    groups: [
      {
        family: "figtree",
        styles: [
          {
            name: "ab-type-body-md",
            fontSize: "1.0625rem",
            lineHeight: "1.6",
            fontWeight: 400,
            letterSpacing: "0em",
          },
        ],
      },
    ],
  },
  spacing: { tokens: [{ name: "ab-space-md", value: "12px" }] },
  shadow: {
    tokens: [{ name: "ab-elevation", value: { light: "0px 1px 2px 0px #000", dark: "none" } }],
  },
};

test("compiles tokens.json in format.md's layout, line 1 the generated marker", () => {
  expect(compileTokensCss(TOKENS, "@font-face {}\n")).toBe(`/* Acme — generated from tokens.json */
:root, [data-theme="light"] {
  --ab-surface: #ffffff;
  --ab-brand: #263316;
  --ab-elevation: 0px 1px 2px 0px #000;
}
[data-theme="dark"] {
  --ab-surface: #12150f;
  --ab-elevation: none;
}
:root {
  --ab-space-md: 12px;
  --font-figtree: Figtree, system-ui, sans-serif;
}
.ab-type-body-md {
  font-family: var(--font-figtree);
  font-size: 1.0625rem;
  line-height: 1.6;
  font-weight: 400;
  letter-spacing: 0em;
}
@font-face {}
`);
});
