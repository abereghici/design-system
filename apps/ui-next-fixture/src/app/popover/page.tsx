import { Popover } from "@platform/ui/popover";

export default function Page() {
  return (
    <main>
      <Popover.Root>
        <Popover.Trigger>Filters</Popover.Trigger>
        <Popover.Content>
          <Popover.Title>Filters</Popover.Title>
          <Popover.Description>Show only the rows that match.</Popover.Description>
          <Popover.Close />
        </Popover.Content>
      </Popover.Root>
    </main>
  );
}
