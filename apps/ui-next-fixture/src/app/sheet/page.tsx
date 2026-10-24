import { Sheet } from "@platform/ui/sheet";

export default function Page() {
  return (
    <main>
      <Sheet.Root>
        <Sheet.Trigger>Open details</Sheet.Trigger>
        <Sheet.Content>
          <Sheet.Title>Invoice 0142</Sheet.Title>
          <Sheet.Body>Two lines</Sheet.Body>
          <Sheet.Close />
        </Sheet.Content>
      </Sheet.Root>
    </main>
  );
}
