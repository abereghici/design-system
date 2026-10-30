import { Select } from "@abereghici/ui/select";

export default function Page() {
  return (
    <main>
      <form>
        <Select.Root label="Region" name="region" placeholder="Choose a region" required>
          <Select.Item value="eu">Europe</Select.Item>
          <Select.Group label="Asia Pacific">
            <Select.Item value="jp">Japan</Select.Item>
          </Select.Group>
        </Select.Root>
        <button>Submit</button>
      </form>
    </main>
  );
}
