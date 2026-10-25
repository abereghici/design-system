import { Combobox } from "@platform/ui/combobox";

export default function Page() {
  return (
    <main>
      <Combobox.Root
        label="Assignee"
        name="assignee"
        placeholder="Search people"
        noOptionsText="No results"
      >
        <Combobox.Item value="ab">Alexandru Bereghici</Combobox.Item>
        <Combobox.Group label="Former members">
          <Combobox.Item value="eh">Erik Halvorsen</Combobox.Item>
        </Combobox.Group>
      </Combobox.Root>
    </main>
  );
}
