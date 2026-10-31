import type { ReactNode } from "react";

import { IconButton } from "../icon-button/icon-button.tsx";
import { HelpIcon } from "../icon/icons/help.tsx";
import { InfoIcon } from "../icon/icons/info.tsx";
import * as Popover from "../popover/popover.tsx";

/**
 * `"trigger-press"`: the button. `"escape-key"`, `"outside-press"`: Escape or a press outside.
 * `"focus-out"`: Tab moved focus past the popover. `"none"`: your state changed. `cancel()` keeps it
 * as it is, except on Escape and outside presses, which the browser has already acted on.
 */
export type ContextualHelpChangeEventDetails = Popover.ChangeEventDetails;

export type ContextualHelpProps = Omit<Popover.RootProps, "children"> & {
  /** `help` for guidance on a task, `info` for a nice-to-know fact about the field. */
  variant?: "help" | "info";
  /** The button's name, such as "About billing cycles": it shows only an icon. */
  "aria-label": string;
  /** The heading of the popover, which names it. */
  title: ReactNode;
  /** The help itself: a sentence or two, and a link to more. */
  children: ReactNode;
} & ({ open?: never } | { defaultOpen?: never });

/**
 * A small icon button beside a field's label that opens a popover of help or information about the
 * field, so the form stays uncluttered. Enter or a press opens it; Escape or a press outside closes
 * it. Give the button a name with `aria-label` and the popover a `title`. Put it next to the label,
 * not inside it, so the field's name stays the label. For a one-line hint on hover use Tooltip; for
 * interactive content, Popover.
 *
 * Tier 1: works before hydration.
 */
export function ContextualHelp({
  variant = "help",
  "aria-label": label,
  title,
  children,
  ...options
}: ContextualHelpProps) {
  const Glyph = variant === "help" ? HelpIcon : InfoIcon;

  return (
    <Popover.Root {...options}>
      <Popover.Trigger asChild>
        <IconButton size="sm" aria-label={label}>
          <Glyph size="sm" />
        </IconButton>
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Title>{title}</Popover.Title>
        <Popover.Description>{children}</Popover.Description>
      </Popover.Content>
    </Popover.Root>
  );
}
