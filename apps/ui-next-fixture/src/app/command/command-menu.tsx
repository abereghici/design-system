"use client";

import { Command } from "@platform/ui/command";

export function CommandMenu() {
  return (
    <Command.Dialog defaultOpen aria-label="Command palette">
      <Command.Input aria-label="Search commands" />
      <Command.Empty>No results</Command.Empty>
      <Command.List aria-label="Commands">
        <Command.Item>New document</Command.Item>
      </Command.List>
      <Command.Footer navigateLabel="Navigate" openLabel="Open" closeLabel="Close" />
    </Command.Dialog>
  );
}
