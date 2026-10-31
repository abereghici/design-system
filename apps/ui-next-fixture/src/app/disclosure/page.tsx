import { Disclosure } from "@abereghici/ui/disclosure";

export default function Page() {
  return (
    <main>
      <Disclosure.Root>
        <Disclosure.Trigger>Advanced settings</Disclosure.Trigger>
        <Disclosure.Content>Retries stop after five attempts.</Disclosure.Content>
      </Disclosure.Root>
    </main>
  );
}
