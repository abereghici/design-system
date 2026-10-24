// Stands in for `#.storybook/preview` and every `storybook/*` module inside the preview bundle.
//
// Story files are CSF Next: `preview.meta(input)` makes a meta, `meta.story(input)` a story, and
// `Story.test(name, fn)` registers a test (https://storybook.js.org/docs/api/csf/csf-next). The
// artifact only needs each story's annotations (`args`, `render`, `globals`) to render it, so
// this keeps the shapes and drops Storybook's runtime (addons, test runner, axe). Test bodies are
// never called, so the testing helpers they use (`expect`, `userEvent`, …) can be absent; the
// bundler shims every missing export (Rolldown `shimMissingExports`).
import type { ComponentType, ReactNode } from "react";

/** What a story file's `preview.meta({...})` and `meta.story({...})` carry that previews use. */
export interface Annotations {
  readonly title?: string;
  readonly component?: ComponentType<Readonly<Record<string, unknown>>>;
  readonly args?: Readonly<Record<string, unknown>>;
  readonly globals?: Readonly<Record<string, unknown>>;
  readonly render?: (args: Readonly<Record<string, unknown>>, context: unknown) => ReactNode;
}

export interface StubMeta {
  readonly input: Annotations;
  readonly story: (input?: Annotations) => StubStory;
}

export interface StubStory {
  readonly input: Annotations;
  readonly meta: StubMeta;
  readonly test: (...args: readonly unknown[]) => null;
}

const preview = {
  meta(input: Annotations): StubMeta {
    const meta: StubMeta = {
      input,
      story: (storyInput = {}) => ({ input: storyInput, meta, test: () => null }),
    };
    return meta;
  },
};

export default preview;

/** `storybook/test`'s `fn()` makes a mock; an args placeholder that does nothing is enough here. */
export const fn = () => () => null;
