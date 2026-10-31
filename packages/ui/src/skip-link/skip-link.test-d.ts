import { expectTypeOf } from "vitest";

import type { SkipLinkProps } from "./skip-link.tsx";

// The link needs its text.
expectTypeOf<{ href: "#main" }>().not.toExtend<SkipLinkProps>();
