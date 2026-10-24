import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import component from "@platform/tokens/source/component.tokens.json";

const next = join(import.meta.dirname, "..", ".next");
const componentTokens = Object.keys(component.component).map((name) => `--ab-${name}:`);
// Longest name first, so `--ab-icon-button-*` belongs to icon-button, not icon.
const components = readdirSync(
  dirname(fileURLToPath(import.meta.resolve("@platform/tokens/components/button.css"))),
)
  .map((file) => file.replace(/\.css$/v, ""))
  .toSorted((a, b) => b.length - a.length);
const ownerOf = (token: string) => components.find((name) => token.startsWith(`--ab-${name}-`));

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

// A token ships when its sheet defines it or a component rule reads it. A component redefining another's token on itself (Button restyles Kbd hints) does neither.
const shippedComponentTokens = (css: string) => {
  const sheets = css.match(/@layer ab\.tokens\{:root\{[^\}]*\}\}/gv)?.join("") ?? "";
  return componentTokens.filter(
    (token) => sheets.includes(token) || css.includes(`var(${token.slice(0, -1)})`),
  );
};

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
  test("a route that imports Button ships only Button's and its Spinner's component tokens", () => {
    expect(button.css).toContain("var(--ab-button-primary-background-color)");
    expect(shippedComponentTokens(button.css)).toContain("--ab-button-primary-background-color:");
    expect(
      shippedComponentTokens(button.css).filter((t) => !/^--ab-(button|spinner)-/v.test(t)),
    ).toEqual([]);
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
    expect(shipped.filter((t) => !/^--ab-(icon|spinner)-/v.test(t))).toEqual([]);
  });
});

const componentRoutes = [
  { name: "badge", tokens: ["badge"], client: [], html: "12.345" },
  { name: "tag", tokens: ["tag"], client: [], html: "Live" },
  { name: "status-dot", tokens: ["status-dot"], client: [], html: "Operational" },
  {
    name: "avatar",
    tokens: ["avatar", "icon"],
    client: ["avatar/avatar-image.tsx"],
    html: 'alt="Ana Popescu"',
  },
  { name: "card", tokens: ["card"], client: [], html: "<h1" },
  { name: "separator", tokens: ["separator"], client: [], html: "<hr" },
  {
    name: "alert",
    tokens: ["alert", "icon", "icon-button"],
    client: ["alert/alert-close.tsx"],
    html: 'aria-label="Dismiss"',
  },
  { name: "empty-state", tokens: ["empty-state", "icon"], client: [], html: "No files yet" },
  {
    name: "checkbox",
    tokens: ["checkbox"],
    client: ["checkbox/checkbox.tsx"],
    html: "Email me updates",
  },
  { name: "switch", tokens: ["switch"], client: ["switch/switch.tsx"], html: 'role="switch"' },
  {
    name: "radio-group",
    tokens: ["fieldset", "radio"],
    client: ["radio-group/radio-group.tsx"],
    html: 'role="radiogroup"',
  },
  { name: "slider", tokens: ["slider"], client: ["slider/slider.tsx"], html: 'type="range"' },
  {
    name: "select",
    tokens: ["input", "select", "icon"],
    client: ["select/select-root.tsx"],
    html: 'label="Asia Pacific"',
  },
  { name: "form", tokens: [], client: ["form/form.tsx"], html: "<form" },
  { name: "fieldset", tokens: ["fieldset"], client: [], html: "<legend" },
  {
    name: "field",
    tokens: ["input"],
    client: ["field/field.tsx"],
    html: "Letters and digits.",
  },
  {
    name: "text-field",
    tokens: ["input"],
    client: ["text-field/text-field.tsx"],
    html: 'dir="auto"',
  },
  {
    name: "text-area",
    tokens: ["input"],
    client: ["text-area/text-area.tsx"],
    html: "<textarea",
  },
  {
    name: "password-field",
    tokens: ["input", "icon", "icon-button", "spinner"],
    client: ["password-field/password-field.tsx"],
    html: 'aria-label="Show password"',
  },
  {
    name: "file-trigger",
    tokens: ["button", "spinner"],
    client: ["button/button.tsx", "file-trigger/file-trigger.tsx"],
    html: 'type="file"',
  },
  {
    name: "drop-zone",
    tokens: ["drop-zone", "button", "spinner"],
    client: ["button/button.tsx", "drop-zone/drop-zone.tsx", "file-trigger/file-trigger.tsx"],
    html: "Drop CSV files here",
  },
  {
    name: "number-field",
    tokens: ["input", "icon", "icon-button", "spinner"],
    client: ["number-field/number-field.tsx"],
    html: 'aria-label="Increase"',
  },
];

describe("each component route ships only its own CSS, tokens and client code", () => {
  test.each(componentRoutes)("$name", ({ name, tokens, client, html }) => {
    const r = route(name);
    expect(r.html).toContain(html);
    const shipped = shippedComponentTokens(r.css);
    const owner = (token: string) => tokens.find((word) => word === ownerOf(token));
    expect(shipped.filter((token) => owner(token) === undefined)).toEqual([]);
    expect(new Set(shipped.map((token) => owner(token)))).toEqual(new Set(tokens));
    expect(uiClientModules(r)).toEqual([...client, "provider/locale.tsx"].toSorted());
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
    ["scroll-area", "animation-timeline:scroll(self)", 0],
    ["spinner", "var(--ab-spinner-color)", 5],
    ["table", "var(--ab-table-body-font)", 10],
    ["skeleton", "var(--ab-skeleton-background-color)", 4],
    ["progress", "var(--ab-progress-indicator-background-color)", 11],
    ["meter", "var(--ab-meter-indicator-background-color)", 13],
    ["link", "var(--ab-link-underline-color)", 5],
    ["skip-link", "var(--ab-skip-link-background-color)", 7],
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
    expect(route("skip-link").html).toContain(">Skip to main content</a>");
    expect(route("link").html).toMatch(/<a class="[^"]+" href="\/">Home<\/a>/v);
  });

  test("a locale reaches client components, and ships only on the route that imports it", () => {
    expect(locale.html).toContain("<output>ro-RO</output>");
    expect(button.js).not.toContain('"ro-RO"');
  });
});

describe("a client leaf inside a Server Component", () => {
  test("Kbd renders its platform keys as Ctrl on the server and resolves them on the client", () => {
    const kbd = route("kbd");
    expect(uiClientModules(kbd)).toEqual(["kbd/kbd-key.tsx", "provider/locale.tsx"]);
    expect(kbd.html).toContain("Ctrl");
    expect(kbd.html).toContain("Enter");
    const tokens = shippedComponentTokens(kbd.css);
    expect(tokens).toHaveLength(10);
    expect(tokens.filter((t) => !t.startsWith("--ab-kbd-"))).toEqual([]);
  });
});
