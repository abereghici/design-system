import { expectTypeOf } from "vitest";

import type * as Dialog from "./dialog.tsx";

// The x button shows only an icon, so it needs a name.
expectTypeOf({}).not.toExtend<Dialog.CloseProps>();
