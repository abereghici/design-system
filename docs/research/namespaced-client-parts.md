# Namespaced client Parts from a Server Component (Next 16)

Spike for ticket #2, run 2026-10-23. It fixes the export shape of every compound component in `@platform/ui`.

Every claim carries a short quote and its source. Text marked **(inference)** is our reading and is not quoted.

## Question

Can a Server Component in a Next 16 App Router app write `<Disclosure.Root>`, `<Disclosure.Trigger>` (dotted access) when the Parts are stateful and live in a `'use client'` module? If yes, which export shapes work? The answer decides between namespaced Parts and flat names (`DisclosureRoot`), and we use one or the other everywhere, never both.

## Decision

**Namespaced Parts.** Every compound component is consumed as `import { Dialog } from "@platform/ui/dialog"` and used as `<Dialog.Root>`, `<Dialog.Trigger>`, `<Dialog.Content>`. The shape is the one Base UI 1.9.0 ships:

```
dialog/
  index.ts        // no directive:  export * as Dialog from "./index.parts";
  index.parts.ts  // no directive:  export { DialogRoot as Root } from "./root/dialog-root"; ...
  root/dialog-root.tsx        // 'use client' only where the Part needs state or effects
  title/dialog-title.tsx      // no directive: stays a Server Component
```

Rules that follow from the results:

1. The namespace object is built in a module **without** `'use client'` (`export * as X from "./index.parts"`).
2. Each Part is a **plain named export** of its own module. `'use client'` goes only on the leaf modules that need it, so a namespace can mix server and client Parts.
3. A `'use client'` module never exports an object of Parts or a component with Parts attached as static properties (`Object.assign(Root, { Trigger })`). Both fail when used from a Server Component.
4. A `'use client'` module never uses `export * from`: Next's webpack loader rejects it (quoted below).

## Versions used

Measured from the installed packages and the build output:

- `next` 16.4.3. The build log prints `▲ Next.js 16.4.3 (Turbopack)`. The production test was also re-run after `next build --webpack`.
- `react` and `react-dom` 19.3.1. Next renders Server Components with its vendored `next/dist/compiled/react-server-dom-turbopack` and `react-server-dom-webpack`.
- `@playwright/test` 1.64.1, with Chrome for Testing 156.0.8078.4 (playwright-core `browsers.json`, chromium revision 1248).
- `typescript` 7.0.2, Node 26.12.1 and pnpm 12.15.0.

## What was built

The app was `apps/spike-rsc-namespace` (deleted in R1, see Throwaway code), a throwaway marked SPIKE in its `package.json` and in every source file. It has one stateful compound component, a disclosure with `Root`, `Trigger` and `Content` that share React context. It is consumed four ways, each by a Server Component page:

| Route                     | Shape                                                                                                                                                                                                         | Result                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `/namespace-import`       | `import * as Disclosure from "./parts"`, where `parts.tsx` is `'use client'` with named exports (Radix style)                                                                                                 | Works in dev and production    |
| `/namespace-reexport`     | `import { Disclosure } from "./disclosure"`, where `index.ts` has no directive and does `export * as Disclosure from "./index.parts"` (Base UI style). It mixes a server Part (`Label`) with the client Parts | Works in dev and production    |
| `/object-in-client`       | A `'use client'` module that exports `const Disclosure = { Root, Trigger, Content }`                                                                                                                          | HTTP 500 in dev and production |
| `/static-props-in-client` | A `'use client'` module that exports `Object.assign(Root, { Root, Trigger, Content })`                                                                                                                        | HTTP 500 in dev and production |

`e2e/namespaced-parts.test.ts` runs the same 5 tests against `next dev` and against `next start` after `next build`, so 10 runs in all. For the working shapes, each test loads the page and expects HTTP 200, the trigger at `aria-expanded="false"` and the content hidden. It then clicks the trigger and expects `aria-expanded="true"` and the content visible. That proves the page server-rendered, hydrated, and that separately imported Parts share one context.

How we know the tests can fail:

- **Red first.** Before the routes existed, all 8 tests failed (404). The server-Part test failed on its own until `Label` was added.
- **Production with webpack.** After `next build --webpack`, the same 4 production tests passed with the same results.
- **The server-only guard fires.** `Label` imports `server-only`. When we temporarily imported it into a `'use client'` module, `next build` failed with `You're importing a module that depends on "server-only".` So `Disclosure.Label` really is a Server Component inside a namespace whose other Parts are client components.

The failing shapes log this on the server:

```
Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined.
```

## Why: sources

### A `'use client'` module is replaced on the server, one reference per named export

- React, `react.dev/reference/rsc/use-client`: "When a file marked with `'use client'` is imported from a Server Component, compatible bundlers will treat the module import as a boundary between server-run and client-run code."
- The same page: "When a server evaluated module imports values from a `'use client'` module, the values must either be a React component or supported serializable prop values to be passed to a Client Component. Any other use case will throw an exception."
- Next.js, `nextjs.org/docs/app/getting-started/server-and-client-components` (lastUpdated 2026-10-05): "`"use client"` is used to declare a **boundary** between the Server and Client module graphs (trees)."
- Next.js 16.4.3 source, `next/dist/build/webpack/loaders/next-flight-loader/index.js`, lines 108–126. On the server, every named export of an ESM client module is rewritten to a stub:

  ```js
  esmSource += `export const ${ref} = registerClientReference(
  function() { throw new Error(${JSON.stringify(`Attempted to call ${ref}() from \
  the server but ${ref} is on the client. ...`)}); },
  ```

  A client reference is that stub function and nothing more. So in the object shape `Disclosure.Root` reads a property that doesn't exist and is `undefined`, which is the "got: undefined" error above. In the static-props shape, `Disclosure` is the reference for the export, not `Root`, so the same happens **(inference from the loader source and the observed error; the Turbopack build gives the same error, so we infer Turbopack rewrites client modules the same way, but we did not read its Rust source)**.

- The same file, lines 101–102: "It's currently unsupported to use "export \*" in a client boundary. Please use named exports instead."
- For CommonJS client modules, Next instead uses `createClientModuleProxy` (`module-proxy.js`). Dotting into that proxy throws "Cannot access … on the server. You cannot dot into a client module from a server component. You can only pass the imported name through." (`react-server-dom-turbopack-server.node.development.js`, line 6253). Our packages are ESM, so they take the per-export path above.

### Why both namespace shapes work

**(Inference.)** Our reading of the loader output above:

- In `import * as Disclosure from "./parts"`, the namespace object is created by the server module that imports it. Its properties are the per-export client references, so `Disclosure.Root` is a real reference.
- `export * as Disclosure from "./index.parts"`, in a module with no directive, builds the same namespace object on the server from the leaf modules' exports. Each export is a client reference or a plain Server Component.

The tests confirm both readings empirically.

### This is what the major libraries ship

- Base UI 1.9.0, `unpkg.com/@base-ui/react@1.9.0/dialog/index.mjs` (no directive): `export * as Dialog from "./index.parts.mjs";`
- `…/dialog/index.parts.mjs` (no directive): `export { DialogRoot as Root } from "./root/DialogRoot.mjs";` and `export { DialogTrigger as Trigger } from "./trigger/DialogTrigger.mjs";`
- `…/dialog/root/DialogRoot.mjs`, line 1: `'use client';`
- Base UI docs, `base-ui.com/react/overview/quick-start`: "import { Popover } from '@base-ui/react/popover';" and "Base UI is tree-shakable, so your app bundle will contain only the components that you actually use."
- Radix, `radix-ui` 1.6.7, `dist/index.mjs`: `import * as Dialog from "@radix-ui/react-dialog";`. The pinned dependency `@radix-ui/react-dialog` 1.1.23 has `dist/index.mjs`, line 1: `"use client";`
- Radix docs, `radix-ui.com/primitives/docs/components/dialog`: `import { Dialog } from "radix-ui";`. The anatomy uses `Dialog.Root`, `Dialog.Trigger`, `Dialog.Portal`, `Dialog.Overlay`, `Dialog.Content`, `Dialog.Title`, `Dialog.Description` and `Dialog.Close`.

### Server-only Parts inside a namespace

- Next.js, same page: "To prevent accidental usage in Client Components, you can use the `server-only` package." Then: "Now, if you try to import the module into a Client Component, there will be a build-time error." And: "In Next.js, installing `server-only` or `client-only` is **optional**." The spike imports it without installing it.
- Next.js, same page: "add `'use client'` at the top of the files that define your interactive components instead of marking large parts of your UI as Client Components."

### APIs used in the spike component

- React 19 context as provider, `react.dev/reference/react/createContext`: "Starting in React 19, you can render `<SomeContext>` as a provider."
- `use(context)`, `react.dev/reference/react/use`: "Call `use` with a context to read its value. Unlike `useContext`, `use` can be called within loops and conditional statements like `if`."
- `aria-expanded` and `aria-controls`, MDN `aria-expanded`: "A button that toggles a widget should have `aria-controls` set to the id of the toggled widget and `aria-expanded` set to the current state of the widget."
- `hidden`, MDN: "The `hidden` attribute indicates that the content of an element should not be presented to the user." It is plain HTML, well below the ADR-0002 floor. webstatus.dev lists no standalone feature for the bare attribute, only `input-hidden` and `hidden-until-found`.

## Consequences for `@platform/ui`

- A compound component's subpath (`@platform/ui/dialog`) exports one namespace (`Dialog`), plus types and data-attribute enums as separate named exports, following Base UI's `index.mjs`.
- Single-part components (Button, Badge) stay flat named exports. They have no Parts, so this is not "mixed" naming. The rule only governs compound components.
- Prop types follow the namespace too. Base UI does `export type * from './root/DialogRoot'` next to the namespace, and its docs reference `Dialog.Root.ChangeEventDetails` (see `docs/research/feedback-events-and-i18n.md`). How we expose types (`Dialog.Root.Props` vs `DialogRootProps`) is left to the first compound-component ticket. **(Not tested here.)**
- **Not measured here:** client bundle size. We have not checked whether a namespace whose Parts are not all rendered ships only the Parts used. The size-budget ticket should measure it.

## Throwaway code

`apps/spike-rsc-namespace` was deleted in R1 (2026-10-24), once `apps/ui-next-fixture` consumed `@platform/ui`. It remains in the repository history at commit `b7cb122`. Its last run that day (Next 16.4.3, Playwright 1.64.1 Chromium, `next build && playwright test` against both `next dev` and `next start`) passed 10 of 10: `namespace-import` and `namespace-reexport` rendered dotted client Parts that hydrated and shared state, `namespace-reexport` mixed a `server-only` Part with client Parts, and `object-in-client` and `static-props-in-client` answered 500 with "Element type is invalid: expected a string … but got: undefined".
