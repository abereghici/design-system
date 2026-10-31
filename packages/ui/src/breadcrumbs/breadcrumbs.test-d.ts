import { expectTypeOf } from "vitest";

import type * as Breadcrumbs from "./breadcrumbs.tsx";

// The navigation landmark needs a name.
expectTypeOf({}).not.toExtend<Breadcrumbs.RootProps>();
