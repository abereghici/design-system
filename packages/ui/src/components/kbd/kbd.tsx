import { Fragment } from "react";
import type { ComponentProps, ReactNode } from "react";

import { mergeProps } from "../../internal/utils/merge-props.ts";
import { VisuallyHidden } from "../visually-hidden/visually-hidden.tsx";

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
   * Key names, case-insensitive: `+` joins keys pressed together (`"mod+k"`, `"shift+enter"`) and a
   * space separates keys pressed one after another (`"g i"`). `mod` is ⌘ on Apple platforms and
   * Ctrl elsewhere. Other names render as written, a single letter upper-cased.
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
  /** The word screen readers say between keys pressed one after another, such as "then". */
  thenLabel?: string;
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
 * Keys pressed together sit close, and the steps of a sequence sit apart. It only shows the keys;
 * your app handles them. On a Button, use its `shortcut`. Inside another control, pass
 * `aria-hidden` and set `aria-keyshortcuts` on the control, so the shortcut isn't read twice.
 *
 * Tier 1: works before hydration.
 */
export function Kbd({ keys, platform, keyLabels, thenLabel, children, ...props }: KbdProps) {
  const steps =
    keys === undefined
      ? [[children]]
      : keys
          .trim()
          .split(/\s+/v)
          .map((step) => step.split("+").map((name) => key(name, { platform, keyLabels })));

  return (
    <kbd dir="ltr" {...mergeProps({ className: styles["root"] }, props)}>
      {steps.map((step, index) => (
        <Fragment key={index}>
          {index > 0 && <VisuallyHidden>{` ${thenLabel ?? ""} `}</VisuallyHidden>}
          <span className={styles["group"]}>
            {step.map((node, keyIndex) => (
              <kbd key={keyIndex} className={styles["key"]}>
                {node}
              </kbd>
            ))}
          </span>
        </Fragment>
      ))}
    </kbd>
  );
}
