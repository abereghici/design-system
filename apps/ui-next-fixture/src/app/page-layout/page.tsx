import { Navbar } from "@abereghici/ui/navbar";
import { PageLayout } from "@abereghici/ui/page-layout";
import { Sidebar } from "@abereghici/ui/sidebar";

export default function Page() {
  return (
    <PageLayout.Root>
      <PageLayout.Header>
        <Navbar.Root aria-label="Main">
          <Navbar.Item>
            <Navbar.Link href="/page-layout" aria-current="page">
              Reports
            </Navbar.Link>
          </Navbar.Item>
        </Navbar.Root>
      </PageLayout.Header>
      <PageLayout.Navigation>
        <Sidebar.Root aria-label="Workspace">
          <Sidebar.Group label="Reports">
            <Sidebar.Item>
              <Sidebar.Link href="/page-layout" aria-current="page">
                Revenue
              </Sidebar.Link>
            </Sidebar.Item>
          </Sidebar.Group>
        </Sidebar.Root>
      </PageLayout.Navigation>
      <PageLayout.Content>
        <h1>Revenue</h1>
      </PageLayout.Content>
      <PageLayout.Aside aria-label="Activity">
        <p>No activity yet</p>
      </PageLayout.Aside>
    </PageLayout.Root>
  );
}
