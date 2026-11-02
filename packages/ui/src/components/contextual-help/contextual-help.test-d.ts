import { expectTypeOf } from "vitest";

import type { ContextualHelpProps } from "./contextual-help.tsx";

type Help = { title: "Billing cycle"; children: "Invoices are sent on the first of each month." };

// The button shows only an icon, so it needs a name.
expectTypeOf<Help>().not.toExtend<ContextualHelpProps>();

// Its title names the popover.
expectTypeOf<{
  "aria-label": "About billing cycles";
  children: "Monthly";
}>().not.toExtend<ContextualHelpProps>();

// It is either controlled or uncontrolled, never both.
expectTypeOf<
  Help & { "aria-label": "Help"; open: true; defaultOpen: true }
>().not.toExtend<ContextualHelpProps>();
