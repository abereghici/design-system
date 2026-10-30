# Contributing

## Repository

```text
apps/
└── ui-next-fixture/     # Next.js app built from the packed packages; checks what each route ships
packages/
├── ui/                  # @abereghici/ui: components, Storybook, tests
├── tokens/              # @abereghici/tokens: DTCG source, Style Dictionary build, fonts
├── typescript-config/   # shared tsconfig (private)
└── oxlint-config/       # shared lint rules (private)
docs/
├── adr/                 # architecture decision records
└── tech-stack.md        # the agreed stack and versions
```

## Development

The Node.js and pnpm versions are pinned in `package.json` under `devEngines`.

```sh
pnpm install
pnpm build                              # build every package
pnpm test                               # unit, browser and size-budget tests
pnpm lint && pnpm format && pnpm check-types
pnpm --filter @abereghici/ui storybook  # Storybook on http://localhost:6006
```

Screenshot tests run on Linux only. `pnpm --filter @abereghici/ui test:screenshots:docker` runs them in the Playwright container image that CI uses.

## Releasing

Releases go through [Changesets](https://changesets.dev).

1. Add a changeset with your change: `pnpm changeset`.
2. Merging to `main` opens a "Version Packages" pull request.
3. Merging that pull request runs the release workflow. Its publish job waits for approval in the `npm` environment, then publishes through npm trusted publishing (OIDC), which attaches provenance. The repository stores no npm token.
