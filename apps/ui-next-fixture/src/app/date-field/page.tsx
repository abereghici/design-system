import { DateField } from "@abereghici/ui/date-field";

export default function Page() {
  return (
    <main>
      <DateField
        label="Date of birth"
        name="birthDate"
        required
        incompleteMessage="Enter a complete date"
      />
    </main>
  );
}
