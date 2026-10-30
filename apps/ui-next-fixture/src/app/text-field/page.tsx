import { TextField } from "@abereghici/ui/text-field";

export default function Page() {
  return (
    <main>
      <TextField label="Email" name="email" type="email" description="We reply within a day." />
    </main>
  );
}
