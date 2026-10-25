import type { ComponentProps } from "react";

import { UserIcon } from "../icon/icons/user.tsx";
import { join } from "../slot/slot.tsx";

import styles from "./avatar.module.css";

export interface FallbackProps extends ComponentProps<"span"> {
  /**
   * The person's name, shown as initials while the picture loads or when it fails. Screen readers
   * never hear it, so name the avatar with the Image's `alt`.
   */
  name?: string;
}

const graphemes = new Intl.Segmenter();

const firstGrapheme = (word = "") => graphemes.segment(word).containing(0)?.segment ?? "";

function initials(name: string) {
  const words = name.split(/\s+/v).filter(Boolean);
  return firstGrapheme(words[0]) + (words.length > 1 ? firstGrapheme(words.at(-1)) : "");
}

export function Fallback({ name, className, children, ...props }: FallbackProps) {
  const text = name === undefined ? "" : initials(name);
  return (
    <span dir="auto" {...props} aria-hidden className={join(styles["fallback"], className)}>
      {children ?? (text === "" ? <UserIcon /> : text)}
    </span>
  );
}
