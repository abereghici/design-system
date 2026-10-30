import { Accordion } from "@abereghici/ui/accordion";

export default function Page() {
  return (
    <main>
      <Accordion.Root defaultValue={["billing"]}>
        <Accordion.Item value="billing">
          <Accordion.Trigger>Billing</Accordion.Trigger>
          <Accordion.Content>Invoices are sent monthly.</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </main>
  );
}
