import { ContextMenu } from "@abereghici/ui/context-menu";

export default function Page() {
  return (
    <main>
      <ContextMenu.Root>
        <ContextMenu.Trigger>Report.pdf</ContextMenu.Trigger>
        <ContextMenu.Content aria-label="File actions">
          <ContextMenu.Item>Duplicate</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
    </main>
  );
}
