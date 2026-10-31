import { expectTypeOf } from "vitest";

import type { CollapsibleGroupProps } from "./sidebar-collapsible-group.tsx";

// A collapsible group opens and folds from its label, so it needs one.
expectTypeOf({ children: null }).not.toExtend<CollapsibleGroupProps>();
