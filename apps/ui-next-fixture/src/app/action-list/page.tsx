import NextLink from "next/link";

import { ActionList } from "@abereghici/ui/action-list";

export default function Page() {
  return (
    <main>
      <ActionList.Root aria-label="Elsewhere">
        <ActionList.LinkItem asChild>
          <NextLink href="/">
            Home
            <ActionList.Description>The fixture index</ActionList.Description>
          </NextLink>
        </ActionList.LinkItem>
      </ActionList.Root>
    </main>
  );
}
