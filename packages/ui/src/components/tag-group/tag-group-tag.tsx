"use client";

import { useId } from "react";
import type { ComponentProps } from "react";

import { XIcon } from "../icon/icons/x.tsx";
import { Tag as StaticTag } from "../tag/tag.tsx";
import type { TagProps as StaticTagProps } from "../tag/tag.tsx";

import { useTagGroup } from "./tag-group-root.tsx";
import styles from "./tag-group.module.css";

export interface TagProps extends Omit<ComponentProps<"li">, "value"> {
  /** Pairs the Tag with an entry of the group's `value`; it shows only while that entry is there. */
  value: string;
  /** The meaning, kept the same across the product, such as `success` for every "Live". */
  variant?: StaticTagProps["variant"];
}

/** A tag with its remove button. */
export function Tag({ value, variant = "neutral", children, ...props }: TagProps) {
  const { state, actions, meta } = useTagGroup("TagGroup.Tag");
  const id = useId();

  if (!state.value.includes(value)) return null;

  return (
    <StaticTag asChild variant={variant}>
      <li {...props}>
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
    </StaticTag>
  );
}
