import NextLink from "next/link";

import { Sidebar } from "@abereghici/ui/sidebar";

export default function Page() {
  return (
    <Sidebar.Root aria-label="Workspace">
      <Sidebar.Group label="Projects">
        <Sidebar.Item>
          <Sidebar.Link href="/sidebar" aria-current="page">
            Sidebar
          </Sidebar.Link>
        </Sidebar.Item>
        <Sidebar.Item>
          <Sidebar.Link asChild>
            <NextLink href="/">Home</NextLink>
          </Sidebar.Link>
        </Sidebar.Item>
      </Sidebar.Group>
      <Sidebar.CollapsibleGroup label="Settings" defaultOpen>
        <Sidebar.Item>
          <Sidebar.Link href="/billing">Billing</Sidebar.Link>
        </Sidebar.Item>
      </Sidebar.CollapsibleGroup>
    </Sidebar.Root>
  );
}
