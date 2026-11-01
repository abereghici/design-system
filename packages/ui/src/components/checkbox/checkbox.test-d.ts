import { expectTypeOf } from "vitest";

import type { CheckboxProps } from "./checkbox.tsx";

// A checkbox without visible text needs aria-label or aria-labelledby.
expectTypeOf({}).not.toExtend<CheckboxProps>();
