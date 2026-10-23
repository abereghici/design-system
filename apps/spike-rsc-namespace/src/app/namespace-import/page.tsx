// Server Component. Shape: `import * as X` straight from the `'use client'` module (Radix style).
import * as Disclosure from "../../disclosure/parts";

export default function Page() {
  return (
    <Disclosure.Root>
      <Disclosure.Trigger>Toggle details</Disclosure.Trigger>
      <Disclosure.Content>Details content</Disclosure.Content>
    </Disclosure.Root>
  );
}
