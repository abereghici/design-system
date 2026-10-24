import NextLink from "next/link";

import { Breadcrumbs } from "@platform/ui/breadcrumbs";

export default function Page() {
  return (
    <main>
      <Breadcrumbs.Root>
        <Breadcrumbs.Item>
          <Breadcrumbs.Link asChild>
            <NextLink href="/">Home</NextLink>
          </Breadcrumbs.Link>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>
          <Breadcrumbs.Link href="/breadcrumbs" aria-current="page">
            Breadcrumbs
          </Breadcrumbs.Link>
        </Breadcrumbs.Item>
      </Breadcrumbs.Root>
    </main>
  );
}
