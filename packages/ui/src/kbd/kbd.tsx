import type { ComponentProps, ReactNode } from "react";

import "@abereghici/tokens/components/kbd.css";

import { mergeProps } from "../internal/slot/slot.tsx";

import { Key } from "./kbd-key.tsx";
import type { KbdFace, KeyLabel } from "./kbd-key.tsx";
import styles from "./kbd.module.css";

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
   * Whether to show Apple keys (⌘, ⌥) or the others (Ctrl, Alt). Pass it when the server knows the
   * user's platform; otherwise the page shows the other keys until it detects the platform.
   */
  platform?: "apple" | "other";
  /**
   * Words screen readers say for the symbol keys, such as `{ command: "Command" }`; without them
   * they read the symbol.
   */
  keyLabels?: Partial<Record<KeyLabel, string>>;
}

function key(
  name: string,
  { platform, keyLabels }: { [Prop in "platform" | "keyLabels"]: KbdProps[Prop] | undefined },
): ReactNode {
  const id = name.toLowerCase();
  const modifier = modifiers[id];
  const glyph = glyphs[id];

  if (modifier !== undefined && platform === undefined) {
    return <Key apple={modifier.apple} other={modifier.other} keyLabels={keyLabels} />;
  }

  const face = modifier?.[platform ?? "other"] ?? glyph;

  if (face?.label !== undefined) return <Key apple={face} other={face} keyLabels={keyLabels} />;

  return face?.text ?? words[id] ?? (name.length === 1 ? name.toUpperCase() : name);
}

/**
 * Shows a keyboard shortcut, one keycap per key: `mod` is ⌘ on Apple platforms and Ctrl elsewhere.
 * It only shows the keys; your app handles them. Inside a control, pass `aria-hidden` and set
 * `aria-keyshortcuts` on the control, so the shortcut isn't read twice.
 *
 * Tier 1: works before hydration.
 */
export function Kbd({ keys, platform, keyLabels, children, ...props }: KbdProps) {
  const content =
    keys === undefined
      ? [children]
      : keys.split("+").map((name) => key(name.trim(), { platform, keyLabels }));

  return (
    <kbd dir="ltr" {...mergeProps({ className: styles["root"] }, props)}>
      {content.map((node, index) => (
        <kbd key={index} className={styles["key"]}>
          {node}
        </kbd>
      ))}
    </kbd>
  );
}
