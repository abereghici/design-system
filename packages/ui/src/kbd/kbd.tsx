import type { ComponentProps, ReactNode } from "react";

import type { Labels } from "../provider/locale.tsx";

import { KbdKey } from "./kbd-key.tsx";
import type { KbdFace } from "./kbd-key.tsx";
import styles from "./kbd.module.css";

type KbdLabels = Labels["kbd"];

const glyphs: Readonly<Record<string, KbdFace>> = {
  enter: { text: "↵", label: "enter" },
  backspace: { text: "⌫", label: "backspace" },
  up: { text: "↑", label: "arrowUp" },
  down: { text: "↓", label: "arrowDown" },
  left: { text: "←", label: "arrowLeft" },
  right: { text: "→", label: "arrowRight" },
};

const modifiers: Readonly<Record<string, { apple: KbdFace; other: KbdFace }>> = {
  mod: { apple: { text: "⌘", label: "command" }, other: { text: "Ctrl" } },
  ctrl: { apple: { text: "⌃", label: "control" }, other: { text: "Ctrl" } },
  shift: { apple: { text: "⇧", label: "shift" }, other: { text: "Shift" } },
  alt: { apple: { text: "⌥", label: "option" }, other: { text: "Alt" } },
};

const words: Readonly<Record<string, string>> = {
  esc: "Esc",
  tab: "Tab",
  space: "Space",
  plus: "+",
};

type KeyName = "mod" | "ctrl" | "shift" | "alt" | "enter" | "backspace" | "esc" | "tab" | "space";

export interface KbdProps extends ComponentProps<"kbd"> {
  /**
   * `+`-separated key names, case-insensitive: `"mod+k"`, `"shift+enter"`. `mod` is ⌘ on Apple
   * platforms and Ctrl elsewhere. Other names render as written, a single letter upper-cased.
   */
  keys?: KeyName | "up" | "down" | "left" | "right" | "plus" | (string & Record<never, never>);
  /**
   * Resolves `mod`, `ctrl`, `shift` and `alt`. Pass it when the server knows the platform; without
   * it they are detected on the client and render the `"other"` keys until hydration.
   */
  platform?: "apple" | "other";
  /** Spoken names of the glyph keys; falls back to the Provider's locale. */
  labels?: Partial<KbdLabels>;
}

function key(
  name: string,
  { platform, labels }: { [Prop in "platform" | "labels"]: KbdProps[Prop] | undefined },
): ReactNode {
  const id = name.toLowerCase();
  const modifier = modifiers[id];
  const glyph = glyphs[id];
  if (modifier !== undefined && platform === undefined) {
    return <KbdKey apple={modifier.apple} other={modifier.other} labels={labels} />;
  }
  const face = modifier?.[platform ?? "other"] ?? glyph;
  if (face?.label !== undefined) return <KbdKey apple={face} other={face} labels={labels} />;
  return face?.text ?? words[id] ?? (name.length === 1 ? name.toUpperCase() : name);
}

/** Shows a keyboard shortcut, one keycap per key. It never binds the shortcut. */
export function Kbd({ keys, platform, labels, children, className, ...props }: KbdProps) {
  const content =
    keys === undefined
      ? [children]
      : keys.split("+").map((name) => key(name.trim(), { platform, labels }));
  return (
    <kbd
      dir="ltr"
      {...props}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
    >
      {content.map((node, index) => (
        <kbd key={index} className={styles["key"]}>
          {node}
        </kbd>
      ))}
    </kbd>
  );
}
