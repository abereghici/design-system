import { expectTypeOf } from "vitest";

import type * as DatePicker from "./date-picker.tsx";

// The calendar button shows only an icon, so it needs a name.
expectTypeOf<{
  label: "Due date";
  incompleteMessage: "Enter a complete date";
}>().not.toExtend<DatePicker.RootProps>();
