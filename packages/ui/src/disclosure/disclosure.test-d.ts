import { expectTypeOf } from "vitest";

import type { Disclosure } from "./index.ts";

// A Disclosure is either controlled or uncontrolled, never both.
expectTypeOf<{ open: true; defaultOpen: true }>().not.toExtend<Disclosure.RootProps>();

// A Trigger says what it shows in its children.
expectTypeOf({}).not.toExtend<Disclosure.TriggerProps>();
