import { expectTypeOf } from "vitest";

import type { IconButtonProps } from "./icon-button.tsx";

// An icon that stays on or off is a ToggleButton, which can also join a ToggleButtonGroup.
expectTypeOf<IconButtonProps>().not.toHaveProperty("pressed");
expectTypeOf<IconButtonProps>().not.toHaveProperty("defaultPressed");
expectTypeOf<IconButtonProps>().not.toHaveProperty("onPressedChange");
