import { expectTypeOf } from "vitest";

import type { ToggleButtonProps } from "./toggle-button.tsx";

// A ToggleButton is either controlled or uncontrolled, never both.
expectTypeOf<{
  value: "bold";
  children: "Bold";
  pressed: true;
  defaultPressed: true;
}>().not.toExtend<ToggleButtonProps>();

// A ToggleButton says what it turns on in its children.
expectTypeOf<{ value: "bold" }>().not.toExtend<ToggleButtonProps>();
