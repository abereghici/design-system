import { expectTypeOf } from "vitest";

import type { DateFieldProps } from "./date-field.tsx";

// A date typed in part is invalid, so it needs its error.
expectTypeOf<{ label: "Date of birth" }>().not.toExtend<DateFieldProps>();
