import { DropdownMenu } from "@platform/ui/dropdown-menu";

export default function Page() {
  return (
    <main>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Duplicate</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.CheckboxItem>Show archived</DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </main>
  );
}
