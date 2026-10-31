import { Command } from "@abereghici/ui/command";

export default function Page() {
  return (
    <main>
      <Command.Root>
        <Command.Input aria-label="Search commands" />
        <Command.Empty>No results</Command.Empty>
        <Command.List aria-label="Commands">
          <Command.Item>New document</Command.Item>
        </Command.List>
      </Command.Root>
    </main>
  );
}
