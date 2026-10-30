# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This repo is **multi-context**. A context is a workspace package under `apps/<name>/` or `packages/<name>/`. Tooling-config packages in `packages/` (`typescript-config`, `oxlint-config`) and the consumer fixture `apps/ui-next-fixture` are not contexts and have no domain docs.

## Before exploring, read these

- **`GLOSSARY-MAP.md`** at the repo root: it points at one `GLOSSARY.md` per context. Read each one relevant to the topic.
- **`docs/adr/`** at the repo root: system-wide decisions. Read ADRs that touch the area you're about to work in.
- **`apps/<name>/docs/adr/`** and **`packages/<name>/docs/adr/`**: context-scoped decisions for the context you're working in.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

When creating domain docs for the first time, create `GLOSSARY-MAP.md` at the root plus a `GLOSSARY.md` inside the relevant context. Never create a root `GLOSSARY.md`.

## File structure

```
/
├── GLOSSARY-MAP.md
├── docs/adr/                          ← system-wide decisions
├── apps/
│   └── <app>/
│       ├── GLOSSARY.md
│       └── docs/adr/                  ← context-specific decisions
└── packages/
    └── <package>/
        ├── GLOSSARY.md
        └── docs/adr/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in the relevant `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_
