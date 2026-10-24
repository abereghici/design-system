import { DateField } from "@platform/ui/date-field";

export default function Page() {
  return (
    <main>
      <DateField label="Date of birth" name="birthDate" required />
    </main>
  );
}
