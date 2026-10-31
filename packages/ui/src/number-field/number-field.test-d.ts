import { expectTypeOf } from "vitest";

import type { NumberFieldProps } from "./number-field.tsx";

// The step buttons show only icons, so they need names.
expectTypeOf<{ label: "Seats" }>().not.toExtend<NumberFieldProps>();
