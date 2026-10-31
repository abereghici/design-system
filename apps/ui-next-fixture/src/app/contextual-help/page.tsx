import { ContextualHelp } from "@abereghici/ui/contextual-help";

export default function Page() {
  return (
    <main>
      <ContextualHelp aria-label="About billing cycles" title="Billing cycle">
        Invoices are sent on the first of each month.
      </ContextualHelp>
    </main>
  );
}
