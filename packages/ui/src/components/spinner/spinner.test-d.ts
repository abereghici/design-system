import { expectTypeOf } from "vitest";

import type { SpinnerProps } from "./spinner.tsx";

// A status needs its message.
expectTypeOf({}).not.toExtend<SpinnerProps>();

// A decorative Spinner says nothing.
expectTypeOf<{ "aria-hidden": true; children: "Loading" }>().not.toExtend<SpinnerProps>();
