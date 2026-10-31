"use client";

import { useId } from "react";
import type { ComponentProps } from "react";

import "@abereghici/tokens/components/tag.css";
import "@abereghici/tokens/components/tag-group.css";

import { XIcon } from "../icon/icons/x.tsx";
import { mergeProps } from "../internal/merge-props/merge-props.ts";
import type { TagProps as StaticTagProps } from "../tag/tag.tsx";

import { useTagGroup } from "./tag-group-root.tsx";
import tag from "../tag/tag.module.css";
import styles from "./tag-group.module.css";

export interface TagProps extends Omit<ComponentProps<"li">, "value"> {
  /** Pairs the Tag with an entry of the group's `value`; it shows only while that entry is there. */
  value: string;
  /** The meaning, kept the same across the product, such as `success` for every "Live". */
  variant?: StaticTagProps["variant"];
}

/** A tag with its remove button. */
export function Tag({ value, variant = "neutral", children, ...props }: TagProps) {
  const { state, actions, meta } = useTagGroup("Tag");
  const id = useId();

  if (!state.value.includes(value)) return null;

  return (
    <li {...mergeProps({ className: tag["root"] }, props)} data-variant={variant}>
      <span id={`${id}-text`}>{children}</span>
      <button
        type="button"
        id={`${id}-remove`}
        className={styles["remove"]}
        aria-label={meta.removeLabel}
        aria-labelledby={`${id}-remove ${id}-text`}
        aria-disabled={state.disabled ? true : undefined}
        onClick={(event) => {
          actions.remove(value, event);
        }}
      >
        <XIcon size="sm" />
      </button>
    </li>
  );
}
