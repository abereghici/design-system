import { expectTypeOf } from "vitest";

import type { SeparatorProps } from "./separator.tsx";

// The ornament is horizontal only.
expectTypeOf<{ orientation: "vertical"; variant: "ornament" }>().not.toExtend<SeparatorProps>();
