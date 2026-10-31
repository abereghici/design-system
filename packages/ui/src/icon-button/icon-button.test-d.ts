import { expectTypeOf } from "vitest";

import type { IconButtonProps } from "./icon-button.tsx";

// An IconButton without aria-label or aria-labelledby has no accessible name.
expectTypeOf({}).not.toExtend<IconButtonProps>();
