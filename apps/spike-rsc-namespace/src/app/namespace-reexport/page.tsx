// Server Component. Shape: `import { X }` from a directive-free module that does
// `export * as X from "./index.parts"` (Base UI style). The namespace mixes a server Part
// (`Label`) with client Parts.
import { Disclosure } from "../../disclosure";

export default function Page() {
  return (
    <Disclosure.Root>
      <Disclosure.Label>Disclosure label</Disclosure.Label>
      <Disclosure.Trigger>Toggle details</Disclosure.Trigger>
      <Disclosure.Content>Details content</Disclosure.Content>
    </Disclosure.Root>
  );
}
