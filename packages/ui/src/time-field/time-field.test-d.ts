import { expectTypeOf } from "vitest";

import type { TimeFieldProps } from "./time-field.tsx";

// A time typed in part is invalid, so it needs its error.
expectTypeOf<{ label: "Start time" }>().not.toExtend<TimeFieldProps>();

// Either the app holds the time or the TimeField does, not both.
expectTypeOf<{
  label: "Start time";
  incompleteMessage: "Enter";
  value: null;
  defaultValue: null;
}>().not.toExtend<TimeFieldProps>();
