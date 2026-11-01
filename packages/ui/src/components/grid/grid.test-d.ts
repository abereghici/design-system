import { expectTypeOf } from "vitest";

import type { GridProps } from "./grid.tsx";

// The minimum is a size token, never a length.
expectTypeOf<{ min: "200px" }>().not.toExtend<GridProps>();
