import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import component from "@platform/tokens/source/component.tokens.json";

const next = join(import.meta.dirname, "..", ".next");
const componentTokens = Object.keys(component.component).map((name) => `--ab-${name}:`);

interface Route {
  readonly html: string;
  readonly css: string;
  readonly js: string;
  readonly clientModules: string;
}

function route(name: string): Route {
  const html = readFileSync(join(next, "server", "app", `${name}.html`), "utf8");
  const assets = (extension: string) =>
    [...new Set(html.match(new RegExp(String.raw`/_next/static/[\w.\/\-]+\.${extension}`, "gv")))]
      .map((url) => readFileSync(join(next, url.slice("/_next/".length)), "utf8"))
      .join("\n");
  const manifest = join(next, "server", "app", name === "index" ? "" : name);
  return {
    html,
    css: assets("css"),
    js: assets("js"),
    clientModules: readFileSync(join(manifest, "page_client-reference-manifest.js"), "utf8"),
  };
}

const button = route("index");
const logo = route("logo");
const locale = route("locale");
const iconButton = route("icon-button");

const uiClientModules = (r: Route) =>
  [...new Set(r.clientModules.match(/(?<=packages\/ui\/src\/)[\w.\/\-]+(?=")/gv))].toSorted();

const shippedComponentTokens = (css: string) =>
  componentTokens.filter((token) => css.includes(token));

describe("the Provider owns the global CSS", () => {
  test.each([
    ["button", button],
    ["logo", logo],
  ])("the %s route starts with the layer order, then the shared tokens, fonts and base", (_, r) => {
    expect(r.css.trimStart()).toMatch(
      /^@layer ab\.reset,\s?ab\.tokens,\s?ab\.base,\s?ab\.components;/v,
    );
    expect(r.css).toContain("--ab-color-surface-default:");
    expect(r.css).toMatch(/@font-face\{font-family:Figtree;/v);
    expect(r.css).toContain("@layer ab.base");
    expect(r.css).toContain("light-dark(");
    expect(r.css).not.toContain("--lightningcss");
  });

  test("it preloads one font, Figtree latin, at the URL its @font-face requests", () => {
    const files = [
      ...button.html.matchAll(
        /<link rel="preload" href="\/_next\/static\/media\/([^"]+)" as="font"/gv,
      ),
    ].map(([, file]) => String(file));
    expect(button.html.match(/as="font"/gv)).toHaveLength(1);
    expect(files).toEqual([expect.stringMatching(/^Figtree-latin\./v)]);
    expect(button.css).toContain(`src:url(../media/${String(files[0])})`);
  });
});

describe("per-component CSS", () => {
  test("a route that imports Button ships Button's CSS and only Button's component tokens", () => {
    expect(button.css).toContain("var(--ab-button-primary-background-color)");
    expect(shippedComponentTokens(button.css)).toContain("--ab-button-primary-background-color:");
    expect(shippedComponentTokens(button.css).filter((t) => !t.startsWith("--ab-button-"))).toEqual(
      [],
    );
  });

  test("a route that imports Logo ships Logo's tokens and none of Button's", () => {
    expect(shippedComponentTokens(logo.css)).toContain("--ab-logo-color:");
    expect(shippedComponentTokens(logo.css).filter((t) => !t.startsWith("--ab-logo-"))).toEqual([]);
    expect(logo.css).not.toContain("--ab-button-");
  });

  test("a route that imports IconButton and an icon ships only their component tokens", () => {
    const shipped = shippedComponentTokens(iconButton.css);
    expect(shipped).toContain("--ab-icon-button-background-color-selected:");
    expect(shipped).toContain("--ab-icon-md-size:");
    expect(shipped.filter((t) => !t.startsWith("--ab-icon-"))).toEqual([]);
  });
});

describe("per-component JS", () => {
  test("only the Button route loads Button's client code", () => {
    expect(uiClientModules(button)).toEqual(["button/button.tsx", "provider/locale.tsx"]);
    expect(button.js).toContain("ab-press");
    expect(uiClientModules(logo)).toEqual(["provider/locale.tsx"]);
    expect(logo.js).not.toContain("ab-press");
    expect(uiClientModules(iconButton)).toEqual([
      "icon-button/icon-button.tsx",
      "provider/locale.tsx",
    ]);
  });

  test.each([
    ["heading", "var(--ab-type-heading-lg)", 0],
    ["text", "var(--ab-type-body-md)", 0],
    ["spinner", "var(--ab-spinner-color)", 5],
    ["skeleton", "var(--ab-skeleton-background-color)", 4],
    ["progress", "var(--ab-progress-indicator-background-color)", 11],
    ["meter", "var(--ab-meter-indicator-background-color)", 13],
  ])(
    "the %s route renders on the server and ships its CSS and tokens only",
    (name, rule, count) => {
      const r = route(name);
      expect(uiClientModules(r)).toEqual(["provider/locale.tsx"]);
      expect(r.css).toContain(rule);
      const tokens = shippedComponentTokens(r.css);
      expect(tokens).toHaveLength(count);
      expect(tokens.filter((t) => !t.startsWith(`--ab-${name}-`))).toEqual([]);
    },
  );

  test("Server Components label and format on the server", () => {
    expect(route("spinner").html).toContain('aria-label="Loading"');
    expect(route("progress").html).toContain("40\u00A0%");
    expect(route("meter").html).toContain("42%");
  });

  test("a locale reaches client components, and ships only on the route that imports it", () => {
    expect(locale.html).toContain("<output>ro-RO</output>");
    expect(button.js).not.toContain('"ro-RO"');
  });
});
