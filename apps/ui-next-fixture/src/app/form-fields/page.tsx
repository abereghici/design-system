import { NumberField } from "@abereghici/ui/number-field";
import { Select } from "@abereghici/ui/select";
import { TextArea } from "@abereghici/ui/text-area";
import { TextField } from "@abereghici/ui/text-field";

// Four components that share Field's token sheet, on one route.
export default function Page() {
  return (
    <main>
      <TextField label="Email" name="email" type="email" />
      <TextArea label="Message" name="message" />
      <NumberField
        label="Seats"
        name="seats"
        defaultValue={5}
        incrementLabel="Increase"
        decrementLabel="Decrease"
      />
      <Select.Root label="Region" name="region" placeholder="Choose a region">
        <Select.Item value="eu">Europe</Select.Item>
      </Select.Root>
    </main>
  );
}
