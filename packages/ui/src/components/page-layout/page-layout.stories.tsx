import { Card } from "@abereghici/ui/card";
import { Heading } from "@abereghici/ui/heading";
import { Logo } from "@abereghici/ui/logo";
import { Navbar } from "@abereghici/ui/navbar";
import { Sidebar } from "@abereghici/ui/sidebar";

import preview, { partsOf } from "#.storybook/preview.tsx";

import * as PageLayout from "./page-layout.tsx";

const shell = (
  <>
    <PageLayout.Header>
      <Logo label="Bereghici" />
      <Navbar.Root aria-label="Main">
        <Navbar.Item>
          <Navbar.Link href="#orders" aria-current="page">
            Orders
          </Navbar.Link>
        </Navbar.Item>
        <Navbar.Item>
          <Navbar.Link href="#customers">Customers</Navbar.Link>
        </Navbar.Item>
      </Navbar.Root>
    </PageLayout.Header>
    <PageLayout.Navigation>
      <Sidebar.Root aria-label="Workspace">
        <Sidebar.Group label="Reports">
          <Sidebar.Item>
            <Sidebar.Link href="#revenue" aria-current="page">
              Revenue
            </Sidebar.Link>
          </Sidebar.Item>
          <Sidebar.Item>
            <Sidebar.Link href="#refunds">Refunds</Sidebar.Link>
          </Sidebar.Item>
        </Sidebar.Group>
      </Sidebar.Root>
    </PageLayout.Navigation>
    <PageLayout.Content>
      <Heading as="h1">Revenue</Heading>
      <Card.Root>
        <Card.Header>
          <Card.Title asChild>
            <h2>This month</h2>
          </Card.Title>
          <Card.Description>€48,200</Card.Description>
        </Card.Header>
      </Card.Root>
    </PageLayout.Content>
    <PageLayout.Aside aria-label="Activity">
      <Heading as="h2">Activity</Heading>
    </PageLayout.Aside>
  </>
);

const meta = preview.meta({
  title: "Components/PageLayout",
  component: PageLayout.Root,
  subcomponents: partsOf(PageLayout),
  args: { children: shell },
});

export const Default = meta.story({});
