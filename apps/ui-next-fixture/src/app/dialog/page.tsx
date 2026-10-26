import { Dialog } from "@platform/ui/dialog";

export default function Page() {
  return (
    <main>
      <Dialog.Root>
        <Dialog.Trigger>Rename</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Rename project?</Dialog.Title>
          <Dialog.Close />
        </Dialog.Content>
      </Dialog.Root>
    </main>
  );
}
