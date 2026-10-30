import NextLink from "next/link";

import { Inline } from "@abereghici/ui/inline";

export default function Page() {
  return (
    <main>
      <Inline gap="inline-md" justify="end">
        <NextLink href="/">Home</NextLink>
        <NextLink href="/stack">Stack</NextLink>
      </Inline>
    </main>
  );
}
