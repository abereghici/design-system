import { use } from "react";
import type { MouseEvent } from "react";

import { useButton } from "../../internal/interactions/use-button.ts";
import type { ChangeEventDetails as Details } from "../../internal/state/change-request.ts";
import { useControllableState } from "../../internal/state/use-controllable-state.ts";
import { chain } from "../../internal/utils/chain.ts";
import { dispatchFeedback } from "../../internal/utils/dispatch-feedback.ts";
import { ToggleButtonGroupContext } from "../toggle-button-group/toggle-button-group-context.ts";

export type ToggleButtonChangeEventDetails = Details<"none", MouseEvent<HTMLButtonElement>>;

interface ToggleButtonOptions {
  readonly value: string;
  readonly pressed: boolean | undefined;
  readonly defaultPressed: boolean | undefined;
  readonly onPressedChange:
    | ((pressed: boolean, details: ToggleButtonChangeEventDetails) => void)
    | undefined;
  readonly disabled: boolean;
  readonly onClick: ((event: MouseEvent<HTMLButtonElement>) => void) | undefined;
}

/**
 * A ToggleButton's state, its own or its ToggleButtonGroup's, and its button props. A press
 * dispatches `ab-toggle`.
 */
export function useToggleButton({
  value,
  pressed,
  defaultPressed,
  onPressedChange,
  disabled,
  onClick,
}: ToggleButtonOptions) {
  const group = use(ToggleButtonGroupContext);
  const [own, request] = useControllableState(pressed, defaultPressed ?? false, onPressedChange);
  const current = group?.pressed(value) ?? own;

  const button = useButton<HTMLButtonElement>({
    disabled,
    onClick: chain(onClick, (event) => {
      if (group === null) {
        if (!request(!current, "none", event)) return;
      } else if (!group.toggle(value, event)) return;

      dispatchFeedback(event.currentTarget, "ab-toggle", {
        component: "ToggleButton",
        userInitiated: true,
      });
    }),
  });

  return { current, grouped: group !== null, button };
}
