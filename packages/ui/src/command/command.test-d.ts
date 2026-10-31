import { expectTypeOf } from "vitest";

import type * as Command from "./command.tsx";

// The search field needs a name.
expectTypeOf({}).not.toExtend<Command.InputProps>();

// The list of commands needs a name.
expectTypeOf({}).not.toExtend<Command.ListProps>();

// The empty state is announced, so it needs its text.
expectTypeOf({}).not.toExtend<Command.EmptyProps>();

// The palette is a dialog, so it needs a name.
expectTypeOf<{ children: null }>().not.toExtend<Command.DialogProps>();
