import { Select } from "@platform/ui/select";

export default function Page() {
  return (
    <main>
      <Select.Root label="Region" name="region" placeholder="Choose a region" required>
        <Select.Item value="eu">Europe</Select.Item>
        <Select.Group label="Asia Pacific">
          <Select.Item value="jp">Japan</Select.Item>
        </Select.Group>
      </Select.Root>
    </main>
  );
}
