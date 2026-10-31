"use client";

import type { ComponentProps, MouseEvent } from "react";

import "@abereghici/tokens/components/tag-group.css";

import { dispatchFeedback } from "../feedback-event/feedback-event.ts";
import type { ChangeEventDetails as Details } from "../internal/change-request/change-request.ts";
import { createSafeContext } from "../internal/create-safe-context/create-safe-context.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";
import { useControllableState } from "../internal/uncontrolled-state/use-controllable-state.ts";

import styles from "./tag-group.module.css";

/** `"remove-press"`: a remove button's click, Enter or Space. `cancel()`: keeps the Tag. */
export type ChangeEventDetails = Details<"remove-press">;

interface TagGroupContextValue {
  readonly state: { readonly value: readonly string[]; readonly disabled: boolean };
  readonly actions: {
    readonly remove: (tag: string, event: MouseEvent<HTMLButtonElement>) => void;
  };
  readonly meta: { readonly removeLabel: string };
}

export const [TagGroupContext, useTagGroup] =
  createSafeContext<TagGroupContextValue>("TagGroup.Root");

export type RootProps = Omit<ComponentProps<"ul">, "defaultValue"> & {
  /** The `value`s of the Tags shown, when your state holds them. */
  value?: ReadonlyArray<string>;
  /** The Tags shown on the first render when it holds its own state. */
  defaultValue?: ReadonlyArray<string>;
  /**
   * Called before a Tag is removed, with the `value`s that would remain. Focus then moves to the
   * next Tag, else the previous one, else the group; focus something here to send it elsewhere.
   */
  onValueChange?: (value: string[], details: ChangeEventDetails) => void;
  /** The word each remove button says before its Tag's text, such as "Remove". */
  removeLabel: string;
  /**
   * Blocks removal but keeps the remove buttons focusable and announced, so everyone can still find
   * them; say nearby why it is unavailable.
   */
  disabled?: boolean;
} & (
    | { value: ReadonlyArray<string>; defaultValue?: never }
    | { defaultValue: ReadonlyArray<string>; value?: never }
  );

/**
 * Removable tags, such as active filters or chosen values. Each Tag has a remove button that reads
 * `removeLabel` before the Tag's text ("Remove Draft"), and every removal dispatches a bubbling
 * `ab-dismiss`. For a static label, use Tag.
 *
 * Tier 2: shows its final content before hydration and works after it; with JavaScript off, the
 * remove buttons are hidden.
 */
export function Root({
  value,
  defaultValue,
  onValueChange,
  removeLabel,
  disabled = false,
  ...props
}: RootProps) {
  const [current, request] = useControllableState(value, defaultValue ?? [], onValueChange);

  function remove(tag: string, event: MouseEvent<HTMLButtonElement>) {
    const button = event.currentTarget;
    const next = current.filter((v) => v !== tag);

    if (disabled || !request(next, "remove-press", event.nativeEvent)) return;

    dispatchFeedback(button, "ab-dismiss", { component: "TagGroup", userInitiated: true });

    // Only focus that would be lost moves: onValueChange may have sent it elsewhere.
    if (document.activeElement !== button) return;

    const item = button.closest("li");
    const neighbour = item?.nextElementSibling ?? item?.previousElementSibling;

    (neighbour?.querySelector("button") ?? item?.parentElement)?.focus();
  }

  return (
    <TagGroupContext
      value={{ state: { value: current, disabled }, actions: { remove }, meta: { removeLabel } }}
    >
      <ul
        {...mergeProps({ className: styles["root"], tabIndex: -1 }, props)}
        data-disabled={disabled ? "" : undefined}
      />
    </TagGroupContext>
  );
}
