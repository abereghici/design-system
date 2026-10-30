import { Tabs } from "@abereghici/ui/tabs";

export default function Page() {
  return (
    <main>
      <Tabs.Root defaultValue="overview">
        <Tabs.List aria-label="Project">
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="overview">Overview</Tabs.Content>
        <Tabs.Content value="settings">Settings</Tabs.Content>
      </Tabs.Root>
    </main>
  );
}
