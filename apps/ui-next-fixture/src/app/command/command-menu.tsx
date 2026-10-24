"use client";

import { Command } from "@platform/ui/command";

export function CommandMenu() {
  return (
    <Command.Dialog defaultOpen>
      <Command.Input />
      <Command.Empty />
      <Command.List>
        <Command.Item>New document</Command.Item>
      </Command.List>
      <Command.Footer />
    </Command.Dialog>
  );
}
