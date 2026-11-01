import { expectTypeOf } from "vitest";

import type * as Splitter from "./splitter.tsx";

// The handle needs a name.
expectTypeOf({}).not.toExtend<Splitter.HandleProps>();

// Either the app holds the size or the Splitter does, not both.
expectTypeOf<{ value: 40; defaultValue: 30 }>().not.toExtend<Splitter.RootProps>();
