import { expectTypeOf } from "vitest";

import type * as Popover from "./popover.tsx";

// The x button shows only an icon, so it needs a name.
expectTypeOf({}).not.toExtend<Popover.CloseProps>();
