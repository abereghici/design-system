import { expectTypeOf } from "vitest";

import type * as Sidebar from "./sidebar.tsx";

// A Sidebar without aria-label or aria-labelledby leaves its landmark unnamed.
expectTypeOf<{ children: null }>().not.toExtend<Sidebar.RootProps>();
