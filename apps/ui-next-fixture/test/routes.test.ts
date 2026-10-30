import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { componentRoutes } from "./component-routes.ts";

const next = join(import.meta.dirname, "..", ".next");
const out = join(import.meta.dirname, "..", "out");
const componentSheets = dirname(
  fileURLToPath(import.meta.resolve("@abereghici/tokens/components/button.css")),
);
// Every token a component sheet declares, as `--ab-<name>:`.
const componentTokens = readdirSync(componentSheets).flatMap((file) =>
  [...readFileSync(join(componentSheets, file), "utf8").matchAll(/^\s+(--ab-[\w\-]+):/gmv)].map(
    ([, name]) => `${String(name)}:`,
  ),
);
// Longest name first, so `--ab-icon-button-*` belongs to icon-button, not icon.
const components = readdirSync(componentSheets)
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
  const html = readFileSync(join(out, `${name}.html`), "utf8");
  const assets = (extension: string) =>
    [...new Set(html.match(new RegExp(String.raw`/_next/static/[\w.\/\-]+\.${extension}`, "gv")))]
      .map((url) => readFileSync(join(out, url), "utf8"))
      .join("\n");
  // No documented output carries the client modules; this internal manifest may move in a Next upgrade.
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
const iconButton = route("icon-button");

// UIProvider, in the root layout, hands its locale to client components; every route carries it.
const localeProvider = "internal/locale/locale-provider";
const formattedNumber = "internal/locale/formatted-number";

// Source modules in the workspace, built ones once installed from the packed package (`test:packed`); compared without extension.
const allClientModules = (r: Route) =>
  [
    ...new Set(
      r.clientModules
        .match(/(?<=packages\/ui\/src\/|@abereghici\/ui\/dist\/)[\w.\/\-]+(?=")/gv)
        ?.map((path) => path.replace(/\.[jt]sx?$/v, "")),
    ),
  ].toSorted();

const uiClientModules = (r: Route) => allClientModules(r).filter((m) => m !== localeProvider);

// A token ships when its sheet defines it or a component rule reads it. A component redefining another's token on itself (Button restyles Kbd hints) does neither.
const tokenSheets = (css: string) =>
  css.match(/@layer ab\.tokens\{:root\{[^\}]*\}\}/gv)?.join("") ?? "";

const shippedComponentTokens = (css: string) => {
  const sheets = tokenSheets(css);

  return componentTokens.filter(
    (token) => sheets.includes(token) || css.includes(`var(${token.slice(0, -1)})`),
  );
};

describe("the UIProvider owns the global CSS", () => {
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

const statics = join(out, "_next", "static");
const built = readdirSync(statics, { recursive: true, encoding: "utf8" })
  .filter((file) => /\.(?:css|js)$/v.test(file))
  .map((file) => readFileSync(join(statics, file), "utf8"))
  .join("\n");
const readInBuild = (name: string) => built.includes(`var(${name})`) || built.includes(`"${name}"`);

test("every component token is read by a component rule or script in the build", () => {
  const names = componentTokens.map((token) => token.slice(0, -1));

  expect(names.filter((name) => !readInBuild(name))).toEqual([]);
});

describe("each component route ships only its own CSS, tokens and client code", () => {
  test.each(componentRoutes)("$name", ({ name, tokens, client, html }) => {
    const r = route(name);

    expect(r.html).toContain(html);

    const shipped = shippedComponentTokens(r.css);
    const owner = (token: string) => tokens.find((word) => word === ownerOf(token));

    expect(shipped.filter((token) => owner(token) === undefined)).toEqual([]);
    expect(new Set(shipped.map((token) => owner(token)))).toEqual(new Set(tokens));
    expect(uiClientModules(r)).toEqual(client.toSorted());
  });
});

// Field's sheet serves six components: a route using several of them still loads it once.
describe("each component route loads every component token sheet once", () => {
  test.each(componentRoutes)("$name", ({ name }) => {
    const declared = [...tokenSheets(route(name).css).matchAll(/--ab-[\w\-]+:/gv)].map(
      ([token]) => token,
    );

    expect(declared.filter((token, index) => declared.indexOf(token) !== index)).toEqual([]);
  });
});

describe("toast() and the Toaster", () => {
  test("a route that only calls toast() loads none of the Toaster's code", () => {
    expect(route("toast").js).not.toContain("Alt+T");
    expect(route("toaster").js).toContain("Alt+T");
  });
});

describe("DatePicker and Calendar", () => {
  test("a route with a lazy Calendar in its DatePicker loads none of the Calendar's code up front", () => {
    expect(route("date-picker").js).not.toContain("data-date");
    expect(route("calendar").js).toContain("data-date");
  });
});

describe("per-component JS", () => {
  test("only the Button route loads Button's client code", () => {
    expect(uiClientModules(button)).toEqual(["button/button"]);
    expect(button.js).toContain("ab-press");
    expect(uiClientModules(logo)).toEqual([]);
    expect(allClientModules(logo)).toEqual([localeProvider]);
    expect(logo.js).not.toContain("ab-press");
    expect(uiClientModules(iconButton)).toEqual(["icon-button/icon-button"]);
  });

  test.each([
    ["heading", "var(--ab-type-heading-lg)", 0, []],
    ["text", "var(--ab-type-body-md)", 0, []],
    ["scroll-area", "animation-timeline:scroll(self)", 0, []],
    ["spinner", "var(--ab-spinner-color)", 4, []],
    ["table", "var(--ab-table-body-font)", 12, []],
    ["skeleton", "var(--ab-skeleton-background-color)", 4, []],
    ["progress", "var(--ab-progress-indicator-background-color)", 11, [formattedNumber]],
    ["meter", "var(--ab-meter-indicator-background-color)", 13, [formattedNumber]],
    ["link", "var(--ab-link-underline-color)", 5, []],
    ["skip-link", "var(--ab-skip-link-background-color)", 7, []],
  ])(
    "the %s route renders on the server and ships its CSS, tokens and client leaves only",
    (name, rule, count, client) => {
      const r = route(name);

      expect(uiClientModules(r)).toEqual(client);
      expect(r.css).toContain(rule);

      const tokens = shippedComponentTokens(r.css);

      expect(tokens).toHaveLength(count);
      expect(tokens.filter((t) => !t.startsWith(`--ab-${name}-`))).toEqual([]);
    },
  );

  test("Server Components render the author's text and their formatting on the server", () => {
    expect(route("spinner").html).toContain(">Loading</span></span>");
    expect(route("pagination").html).toContain('aria-label="Next page"');
    expect(route("progress").html).toContain("40\u00A0%");
    expect(route("meter").html).toContain("42\u00A0%");
    expect(route("skip-link").html).toContain(">Skip to main content</a>");
    expect(route("link").html).toMatch(/<a class="[^"]+" href="\/">Home<\/a>/v);
  });
});

describe("interface text and direction", () => {
  test("the root layout sets dir from getDirection on the server", () => {
    expect(button.html).toContain('<html lang="ro-RO" dir="ltr"');
  });

  test("the root layout opts into the operating system's text size", () => {
    expect(button.html).toContain('<meta name="text-scale" content="scale"/>');
  });

  test("a sorted Table header renders aria-sort and its button on the server", () => {
    expect(route("table").html).toMatch(
      /<th scope="col" aria-sort="ascending" class="[^"]+"><button [^>]*type="button"/v,
    );
  });

  test("a client component ships no interface text of its own; the author's reaches the HTML", () => {
    const alert = route("alert");

    expect(alert.html).toContain('aria-label="Dismiss"');
    expect(alert.js).not.toContain('"Dismiss"');
    expect(alert.js).not.toContain("Skip to main content");
  });
});

const shipsCommand = (js: string) => js.includes('"input-clear"');

describe("a lazily loaded component", () => {
  test("Command stays out of its route's initial JavaScript and loads through the dynamic import", () => {
    const command = route("command");
    const chunks = join(statics, "chunks");

    expect(command.html).toContain(">Search</button>");
    expect(shipsCommand(command.js)).toBe(false);
    expect(
      readdirSync(chunks, { recursive: true, encoding: "utf8" })
        .filter((file) => file.endsWith(".js"))
        .some((file) => shipsCommand(readFileSync(join(chunks, file), "utf8"))),
    ).toBe(true);
  });
});

describe("a client leaf inside a Server Component", () => {
  test("Kbd renders its platform keys as Ctrl on the server and resolves them on the client", () => {
    const kbd = route("kbd");

    expect(uiClientModules(kbd)).toEqual(["kbd/kbd-key"]);
    expect(kbd.html).toContain("Ctrl");
    expect(kbd.html).toContain("Enter");

    const tokens = shippedComponentTokens(kbd.css);

    expect(tokens).toHaveLength(10);
    expect(tokens.filter((t) => !t.startsWith("--ab-kbd-"))).toEqual([]);
  });
});
