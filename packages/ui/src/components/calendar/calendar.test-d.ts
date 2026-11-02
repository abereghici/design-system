import { expectTypeOf } from "vitest";

import type { CalendarProps } from "./calendar.tsx";

// The month buttons show only icons, so they need names.
expectTypeOf({}).not.toExtend<CalendarProps>();

// A Calendar has nothing to disable or submit.
expectTypeOf<CalendarProps>().not.toHaveProperty("disabled");
expectTypeOf<CalendarProps>().not.toHaveProperty("name");
expectTypeOf<CalendarProps>().not.toHaveProperty("form");
