// Server Component. Shape (expected to fail): Parts as static properties of a client component.
import { Disclosure } from "../../static-props-in-client/disclosure";

// Rendered per request so the expected failure is a 500 at request time, not a failed `next build`.
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Disclosure.Root>
      <Disclosure.Trigger>Toggle details</Disclosure.Trigger>
      <Disclosure.Content>Details content</Disclosure.Content>
    </Disclosure.Root>
  );
}
