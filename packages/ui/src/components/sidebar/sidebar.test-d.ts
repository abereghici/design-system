import { expectTypeOf } from "vitest";

import type { CollapsibleGroupProps } from "./sidebar-collapsible-group.tsx";
import type * as Sidebar from "./sidebar.tsx";

// A Sidebar without aria-label or aria-labelledby leaves its landmark unnamed.
expectTypeOf<{ children: null }>().not.toExtend<Sidebar.RootProps>();

// A collapsible group opens and folds from its label, so it needs one.
expectTypeOf({ children: null }).not.toExtend<CollapsibleGroupProps>();

// A collapsible group reports its open changes with Sidebar's own details type.
expectTypeOf<NonNullable<Sidebar.CollapsibleGroupProps["onOpenChange"]>>()
  .parameter(1)
  .toEqualTypeOf<Sidebar.ChangeEventDetails>();
