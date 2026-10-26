import { Fieldset } from "@platform/ui/fieldset";

export default function Page() {
  return (
    <main>
      <Fieldset.Root disabled>
        <Fieldset.Legend>Billing address</Fieldset.Legend>
        <input name="street" aria-label="Street" />
      </Fieldset.Root>
    </main>
  );
}
