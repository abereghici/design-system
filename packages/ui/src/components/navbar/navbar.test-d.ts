import { expectTypeOf } from "vitest";

import type * as Navbar from "./navbar.tsx";

// A Navbar without aria-label or aria-labelledby leaves its landmark unnamed.
expectTypeOf<{ children: null }>().not.toExtend<Navbar.RootProps>();
