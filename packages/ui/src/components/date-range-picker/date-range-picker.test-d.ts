import { expectTypeOf } from "vitest";

import type * as DateRangePicker from "./date-range-picker.tsx";

// Each date and the calendar button need names.
expectTypeOf<{
  label: "Trip dates";
  incompleteMessage: "";
  reversedMessage: "";
}>().not.toExtend<DateRangePicker.RootProps>();
