import { expectTypeOf } from "vitest";

import type { ButtonProps } from "./button.tsx";

// A Button opens a dialog or a popover through invoker commands, without script.
expectTypeOf<Pick<ButtonProps, "command" | "commandfor">>().toEqualTypeOf<{
  command?: string | undefined;
  commandfor?: string | undefined;
}>();
