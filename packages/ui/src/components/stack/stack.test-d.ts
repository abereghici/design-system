import { expectTypeOf } from "vitest";

import type { StackProps } from "./stack.tsx";

// The gap is a stack space token, never a length.
expectTypeOf<{ gap: "1rem" }>().not.toExtend<StackProps>();
