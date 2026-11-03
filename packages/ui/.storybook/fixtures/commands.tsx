import { Command } from "@abereghici/ui/command";
import { PlusIcon } from "@abereghici/ui/icons/plus";
import { Kbd } from "@abereghici/ui/kbd";

/** Commands named past the palette's width, and a thousand of them. */
export const longCommands = (
  <>
    <Command.Input
      aria-label="Search commands"
      placeholder="Saisissez une commande ou recherchez…"
    />
    <Command.Empty>Aucun résultat</Command.Empty>
    <Command.List aria-label="Commands">
      <Command.Group heading="Documents partagés avec Northwind Industries Holdings">
        <Command.Item aria-keyshortcuts="Meta+Shift+N Control+Shift+N">
          <PlusIcon />
          Ouvrir « Q3 2026 board pack (final, revised) v12 » dans un nouvel onglet
          <Kbd keys="mod+shift+n" aria-hidden />
        </Command.Item>
        <Command.Item>
          bartholomew.fitzgerald@northwind-industries-holdings.example.com
        </Command.Item>
      </Command.Group>
    </Command.List>
    <Command.Footer navigateLabel="Naviguer" openLabel="Ouvrir" closeLabel="Fermer" />
  </>
);

export const manyCommands = (
  <>
    <Command.Input aria-label="Search commands" />
    <Command.List aria-label="Commands">
      {Array.from({ length: 1000 }, (_, index) => (
        <Command.Item key={index}>{`Document ${index + 1}`}</Command.Item>
      ))}
    </Command.List>
  </>
);
