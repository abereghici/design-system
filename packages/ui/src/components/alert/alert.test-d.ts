import { expectTypeOf } from "vitest";

import type * as Alert from "./alert.tsx";

// Close shows only an icon, so it needs a name.
expectTypeOf({}).not.toExtend<Alert.CloseProps>();

// Close shows only its icon, so it takes no children.
expectTypeOf<Alert.CloseProps>().not.toHaveProperty("children");
