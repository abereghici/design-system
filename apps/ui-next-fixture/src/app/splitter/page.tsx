import { Splitter } from "@abereghici/ui/splitter";

export default function Page() {
  return (
    <main>
      <Splitter.Root defaultValue={30}>
        <Splitter.Panel>Folders</Splitter.Panel>
        <Splitter.Handle aria-label="Resize folders" />
        <Splitter.Panel>Preview</Splitter.Panel>
      </Splitter.Root>
    </main>
  );
}
