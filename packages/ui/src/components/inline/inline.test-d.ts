import { expectTypeOf } from "vitest";

import type { InlineProps } from "./inline.tsx";

// The gap is an inline space token, never a length.
expectTypeOf<{ gap: "8px" }>().not.toExtend<InlineProps>();
