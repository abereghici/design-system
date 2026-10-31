import { expectTypeOf } from "vitest";

import type * as Sheet from "./sheet.tsx";

// The x button shows only an icon, so it needs a name.
expectTypeOf({}).not.toExtend<Sheet.CloseProps>();
