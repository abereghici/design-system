import { expectTypeOf } from "vitest";

import type { IconButtonProps } from "./icon-button.tsx";

// An IconButton without aria-label or aria-labelledby has no accessible name.
expectTypeOf({}).not.toExtend<IconButtonProps>();

// An icon that stays on or off is a ToggleButton, which can also join a ToggleButtonGroup.
expectTypeOf<IconButtonProps>().not.toHaveProperty("pressed");
expectTypeOf<IconButtonProps>().not.toHaveProperty("defaultPressed");
expectTypeOf<IconButtonProps>().not.toHaveProperty("onPressedChange");
