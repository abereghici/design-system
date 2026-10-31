import { Combobox } from "@abereghici/ui/combobox";

const people = (
  <>
    <Combobox.Item value="ab">Alexandru Bereghici</Combobox.Item>
    <Combobox.Group label="Former members">
      <Combobox.Item value="eh">Erik Halvorsen</Combobox.Item>
    </Combobox.Group>
  </>
);

export default function Page() {
  return (
    <main>
      <form>
        <Combobox.Root
          label="Assignee"
          name="assignee"
          defaultValue="ab"
          placeholder="Search people"
          noOptionsText="No results"
        >
          {people}
        </Combobox.Root>
        <Combobox.Root
          label="Reviewers"
          name="reviewers"
          selectionMode="multiple"
          defaultValue={["ab", "eh"]}
          removeLabel="Remove"
          noOptionsText="No results"
        >
          {people}
        </Combobox.Root>
        <button>Submit</button>
      </form>
    </main>
  );
}
